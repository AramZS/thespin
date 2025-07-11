// server.js
// where your node app starts

// init project
const express = require("express");
var cors = require("cors");
const app = express();
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const markdownHandler = require("./markdown-to-col");
const Mustache = require("mustache");
const fs = require("fs");

const gridHandler = require("./build-grid");

const adapter = new FileSync("db.json");
const db = low(adapter);

const dgadapter = new FileSync("datagriddb.json");
const dgdb = low(dgadapter);

var bodyParser = require("body-parser");

const Clocks = require("./clocks");

const getMainTemplate = function (date, archive, otherFiles) {
  var site = {
    1: "",
    2: "",
    3: ""
  };
  for (let [key, value] of Object.entries(site)) {
    // console.log(`${key}: ${value}`);
    if (site.hasOwnProperty(key)) {
      site[key] = markdownHandler.process(date, key);
    }
  }
  site.letters = [];
  site.hasLetters = false;
  site.hasText = false; 
  site.texts = [];
  let textsContent = markdownHandler.processTexts(date)
  if (textsContent){
    site.texts.push({content: textsContent});
    site.hasText = true;
  }

  var chars = db
    .get("characters")
    .filter(el => {
      return el.selected;
    })
    .value();
  var selectedCharacterIds = chars.map(
    char => char.id.charAt(0).toUpperCase() + char.id.slice(1)
  );
  console.log("Characters for letters", selectedCharacterIds);
  for (let [key, value] of Object.entries(selectedCharacterIds)) {
    console.log(`${key}: ${value}`);
    if (selectedCharacterIds.hasOwnProperty(key) && value) {
      var aLetter = markdownHandler.processLetter(date, value);
      if (aLetter !== false) {
        site.letters.push({ to: value, content: aLetter });
        // console.log(site.letters)
        site.hasLetters = true;
      }
    }
  }
  site.previously = "";
  var previousLetter = markdownHandler.processLetter(date, "intro");
  if (previousLetter) {
    site.previously = previousLetter;
  }
  site.date = date;
  site.days = otherFiles ? JSON.stringify(otherFiles) : false
  site.fileDepth = archive ? "../" : "";
  site.isLive = archive ? false : true;
  Object.assign(site, markdownHandler.getDateMeta(date));
  var file = fs.readFileSync("./views/handlebars.mst").toString();
  var html = Mustache.render(file, site);
  return html;
};

var walkDir = function (dir) {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = dir + "/" + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(walkDir(file));
    } else {
      /* Is a file */
      results.push(file);
    }
  });
  return results;
};

var writeJsonToArchive = function (path, data) {
  fs.writeFile("./docs/json/" + path + ".json", JSON.stringify(data), err => {
    // throws an error, you could also catch it here
    if (err) {
      console.log("File Write Error", err);
    }

    // success case, the file was saved
    console.log("JSON file saved saved!");
  });
  return data;
};

// Set some defaults (required if your JSON file is empty)
db.defaults({
  characters: [],
  users: [],
  count: 0
}).write();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

app.use(cors());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

app.get("/character/:id", function (request, response) {
  console.log("param", request.params, "datais", request.data);
  var char = db
    .get("characters")
    .find({
      id: request.params.id
    })
    .value();
});

app.get("/characters", function (request, response) {
  response.json(writeJsonToArchive("characters", db.get("characters").value()));
});

app.post("/character/:id", function (request, response) {
  console.log("param", request.params, "data", request.body);
  var char = db
    .get("characters")
    .find({
      id: request.params.id
    })
    .value();
  console.log(char);
  try {
    if (char.selected) {
      response.json({
        result: false
      });
    } else {
      /**
      char.selected = true;
      char.player = request.body.user;
      var data = db
        .get("posts")
        .find({
          id: request.params.id
        })
        .assign(char)
        .write();
        **/
      response.json({
        result: true,
        data: data
      });
    }
  } catch (e) {
    console.log("error", e);
    response.json({
      result: false
    });
  }
});

app.get("/text/:date/:col", function (request, response) {
  console.log("param", request.params, "data", request.body);
  var html = markdownHandler.process(request.params.date, request.params.col);
  fs.mkdir(
    "./docs/json/text/" + request.params.date,
    { recursive: true },
    err => {
      var path = "text/" + request.params.date + "/" + request.params.col;
      writeJsonToArchive(path, { result: true, data: html });
      if (err) throw err;
    }
  );
  response.json({
    result: true,
    data: html
  });
});

app.get("/archive/:date", function (request, response) {
  var html = getMainTemplate(request.params.date, true);

  response.send(html);
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  var fileName = "./text/";
  var files = fs.readdirSync(fileName);
  console.log("Current date:", files[files.length - 1]);
  var html = getMainTemplate(files.pop(), null, files);

  response.send(html);
  //response.sendFile(__dirname + "/views/index.html");
});
app.get("/template", function (request, response) {
  response.sendFile(__dirname + "/views/template.html");
});

app.get("/docs", async function (request, response) {
  var fileName = "./text/";
  var files = fs.readdirSync(fileName);
  var publicFileNames = "./public/";
  var publicFiles = fs.readdirSync(publicFileNames);
  console.log("Current date:", files[files.length - 1]);
  //var indexHtml = getMainTemplate(files.pop());
  var indexHtml = getMainTemplate(files[files.length - 1]);
  var promises = [];
  promises.push(
    new Promise(function (resolve, reject) {
      fs.writeFile("./docs/index.html", indexHtml, err => {
        // throws an error, you could also catch it here
        if (err) {
          reject(err);
          console.log("File Write Error", err);
        }
        // success case, the file was saved
        resolve(true);
        console.log("Index saved!");
      });
    })
  );

  files.forEach(function (fileName) {
    var aHtml = getMainTemplate(fileName, true);
    promises.push(
      new Promise(function (resolve, reject) {
        fs.writeFile("./docs/archive/" + fileName + ".html", aHtml, err => {
          // throws an error, you could also catch it here
          if (err) {
            reject(err);
            console.log("File Write Error", err);
          }

          // success case, the file was saved
          console.log("File saved saved!");
          resolve(true);
        });
      })
    );
  });

  publicFiles.forEach(function (fileName) {
    promises.push(
      new Promise(function (resolve, reject) {
        fs.copyFile(publicFileNames + fileName, "./docs/" + fileName, err => {
          // throws an error, you could also catch it here
          if (err) {
            reject(err);
            console.log("File Write Error", err);
          }

          // success case, the file was saved
          console.log("File saved saved!");
          resolve(true);
        });
      })
    );
  });
  await Promise.all(promises);
  //var html = getMainTemplate(files[files.length - 1]);
  console.log("Serve Built File");
  response.sendFile(__dirname + "/docs/index.html");
});
app.get("/docs/archive/:date", function (request, response) {
  response.sendFile(
    __dirname + "/docs/archive/" + request.params.date + ".html"
  );
});
app.get("/docs/:fileName", function (request, response) {
  response.sendFile(__dirname + "/docs/" + request.params.fileName);
});

app.get("/grid", async function (request, response) {
  var grid = await gridHandler.getDatagrid();
  response.send(grid);
});

// Factions

app.get("/faction/", function (request, response) {
  console.log("param", request.params, "data", request.body);
  try {
    /**
      char.selected = true;
      char.player = request.body.user;
      var data = db
        .get("posts")
        .find({
          id: request.params.id
        })
        .assign(char)
        .write();
        **/
    response.json({
      result: true,
      data: Clocks.tables('factions')
    });
  } catch (e) {
    console.log("error", e);
    response.json({
      result: false
    });
  }
});

app.get("/faction/:id", function (request, response) {
  console.log("param", request.params, "data", request.body);
  try {
    /**
      char.selected = true;
      char.player = request.body.user;
      var data = db
        .get("posts")
        .find({
          id: request.params.id
        })
        .assign(char)
        .write();
        **/
    response.json({
      result: true,
      data: Clocks.getFaction(request.params.id)
    });
  } catch (e) {
    console.log("error", e);
    response.json({
      result: false
    });
  }
});

app.get("/faction/:id/clocks", function (request, response) {
  console.log("param", request.params, "data", request.body);
  try {
    response.json({
      result: true,
      data: Clocks.getFactionClocks(request.params.id)
    });
  } catch (e) {
    console.log("error", e);
    response.json({
      result: false
    });
  }
});

app.post("/faction/create", function (request, response) {
  console.log("param", request.params, "data", request.body);
  try {
    response.json({
      result: true,
      data: Clocks.setFaction(request.body.name, request.body.abrv)
    });
  } catch (e) {
    console.log("error", e);
    response.json({
      result: false
    });
  }
});

app.post("/faction/:id", function (request, response) {
  console.log("param", request.params, "data", request.body);
  try {
    response.json({
      result: true,
      data: Clocks.setFactionName(request.body.name, request.params.id)
    });
  } catch (e) {
    console.log("error", e);
    response.json({
      result: false
    });
  }
});

app.post("/faction/:id/clocks/", function (request, response) {
  console.log("param", request.params, "data", request.body);
  try {
    response.json({
      result: true,
      data: Clocks.setFactionClocks(request.params.id, request.body.name, request.body.level, request.body.type)
    });
  } catch (e) {
    console.log("error", e);
    response.json({
      result: false
    });
  }
});


// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
