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
		3: "",
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
	let textsContent = markdownHandler.processTexts(date);
	if (textsContent) {
		site.texts.push({ content: textsContent });
		site.hasText = true;
	}

	var chars = db
		.get("characters")
		.filter((el) => {
			return el.selected;
		})
		.value();
	var selectedCharacterIds = chars.map(
		(char) => char.id.charAt(0).toUpperCase() + char.id.slice(1)
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
	site.days = otherFiles ? JSON.stringify(otherFiles) : false;
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
	fs.writeFile(
		"./docs/json/" + path + ".json",
		JSON.stringify(data),
		(err) => {
			// throws an error, you could also catch it here
			if (err) {
				console.log("File Write Error", err);
			}

			// success case, the file was saved
			console.log("JSON file saved saved!");
		}
	);
	return data;
};

// Set some defaults (required if your JSON file is empty)
db.defaults({
	characters: [],
	users: [],
	count: 0,
}).write();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

app.use(cors());

// http://expressjs.com/en/starter/static-files.html
// app.use(express.static("public"));
app.use(express.static("_site"));

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
	console.log("Your app is listening on port " + listener.address().port);
});
