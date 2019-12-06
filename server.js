// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ characters: [], users: [], count: 0 })
  .write();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));


app.get("/character/:id", function(request, response) {
  console.log("param", request.params);
});

app.get("/characters/", function(request, response) {
  request.json(db.get('characters').value());
});

app.post("/character/:id", function(request, response) {
  console.log("param", request.params);
});


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
