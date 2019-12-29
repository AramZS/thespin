// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const markdownHandler = require("./markdown-to-col");

const adapter = new FileSync("db.json");
const db = low(adapter);

var bodyParser = require("body-parser");

// Set some defaults (required if your JSON file is empty)
db.defaults({ characters: [], users: [], count: 0 }).write();

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

app.get("/character/:id", function(request, response) {
  console.log("param", request.params, "datais", request.data);
  var char = db
    .get("characters")
    .find({ id: request.params.id })
    .value();
});

app.get("/characters/", function(request, response) {
  response.json(db.get("characters").value());
});

app.post("/character/:id", function(request, response) {
  console.log("param", request.params, "data", request.body);
  var char = db
    .get("characters")
    .find({ id: request.params.id })
    .value();
  console.log(char);
  try {
  if (char.selected) {
    response.json({ result: false });
  } else {
    
    char.selected = true;
    char.player = request.body.user;
    var data = db
      .get("posts")
      .find({ id: request.params.id })
      .assign(char)
      .write();
           response.json({ result: true, data: data }); 
 

  }
  } catch (e) {
    console.log('error', e);
    response.json({ result: false });
  }
});

app.get("/text/:date/:col", function(request, response) {
  console.log("param", request.params, "data", request.body);
  var html = markdownHandler.process(request.params.date, request.params.col);
  response.json({ result: true, data: html }); 
});

app.get("/:date", function(request, response) {
  console.log("param", request.params, "data", request.body);
  var cols = { 1: '', 2: '', 3: '', };
  for (let [key, value] of Object.entries(cols)) {
  // console.log(`${key}: ${value}`);
  if (cols.hasOwnProperty(key)){
    cols[key] = markdownHandler.process(request.params.date, key);
  }
}
  
  response.json({ result: true, data: html }); 
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});
app.get("/template", function(request, response) {
  response.sendFile(__dirname + "/views/template.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
