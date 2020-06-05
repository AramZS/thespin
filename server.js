// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const markdownHandler = require("./markdown-to-col");
const Mustache = require("mustache");
const fs = require("fs");

const adapter = new FileSync("db.json");
const db = low(adapter);

var bodyParser = require("body-parser");

const getMainTemplate = function (date, archive) {
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
  site.letter = {};
  
    var chars = db
    .get("characters")
    .pullAllWith({
      selected: true
    })
    .value();
  var selectedCharacterIds = chars; // chars.map(char => char.id)
  console.log('Characters for letters', selectedCharacterIds)
  
  site.date = date;
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
  fs.mkdir('./docs/json/text/'+request.params.date, { recursive: true }, (err) => {
    var path = 'text/'+request.params.date+'/'+request.params.col;
      writeJsonToArchive(path, { result: true, data: html });
      if (err) throw err;
  });
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
  var html = getMainTemplate(files[files.length - 1]);

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

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});