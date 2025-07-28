const fs = require("fs-extra");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const markdownHandler = require("./markdown-to-col");
const Mustache = require("mustache");

const gridHandler = require("./build-grid");

const adapter = new FileSync("db.json");
const db = low(adapter);
// Set some defaults (required if your JSON file is empty)
db.defaults({
	characters: [],
	users: [],
	count: 0,
}).write();

const Clocks = require("./clocks");

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

var writeToSite = async (type, path, data, fileType) => {
	const fileTarget = `./_site/${type}/` + path + `.${fileType}`;
	await fs.ensureFile(fileTarget);
	if (fileType === "json") {
		data = JSON.stringify(data);
	}
	fs.writeFile(fileTarget, data, (err) => {
		// throws an error, you could also catch it here
		if (err) {
			console.log("File Write Error", err);
		}

		// success case, the file was saved
		console.log(`${type} file saved saved!`);
	});
	return data;
};

var writeJsonToSite = async function (path, data) {
	return await writeToSite("json", path, data, "json");
};

var writeTextDataToSite = async function (path, data) {
	return await writeToSite("json/text", path, data, "json");
};

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
	site.fileDepth = archive ? "../../" : "";
	site.isLive = archive ? false : true;
	Object.assign(site, markdownHandler.getDateMeta(date));
	var file = fs.readFileSync("./views/handlebars.mst").toString();
	var html = Mustache.render(file, site);
	return html;
};

module.exports = {
	buildFactionClocks: () => {
		const Clocks = require("./clocks");
		let path = (id) => {
			return `/faction/${id}/clocks.json`;
		};
		try {
			let faction = {
				result: true,
				data: Clocks.setFactionClocks(
					request.params.id,
					request.body.name,
					request.body.level,
					request.body.type
				),
			};
		} catch (e) {
			console.log("error", e);
			response.json({
				result: false,
			});
		}
	},
	writeGrid: async () => {
		let grid = await gridHandler.getDatagrid();
		return await writeToSite("", "grid/index", grid, "html");
		return fs.writeFileSync("./_site/grid/index.html", grid, "utf8");
	},
	copyPublic: async () => {
		return fs.copySync("./public", "./_site/");
	},
	writeCharacters: () => {
		return writeJsonToSite("characters", db.get("characters").value());
	},
	writeCols: async () => {
		const buildFiles = walkDir("./text");
		for (const dir of buildFiles) {
			console.log("Processing", dir);
			const filepath = dir.split("/");
			const filename =
				filepath[filepath.length - 2] +
				"/" +
				filepath[filepath.length - 1]
					.replace(".md", "")
					.replace(".markdown", "");
			const md = fs.readFileSync(dir).toString();
			let htmlResults = markdownHandler.convert(md);
			let dataJson = { result: true, data: htmlResults };
			//const data = JSON.stringify(dataJson);
			console.log("Writing", filename);
			await writeTextDataToSite(filename, dataJson);
		}
		return true;
	},
	writeChars: async () => {
		db.get("characters")
			.value()
			.forEach(async (character) => {
				const charData = {
					name: character.name,
					abrv: character.abrv,
					id: character.id,
				};
				console.log("Writing character", charData);
				await writeJsonToSite(`characters/${character.id}`, charData);
				await writeJsonToSite(`character/${character.id}`, charData);
				await writeJsonToSite(
					`characters`,
					db.get("characters").value()
				);
			});
		return true;
	},
	writeMainPages: async () => {
		var fileName = "./text/";
		var files = fs.readdirSync(fileName);
		files.forEach(async (file) => {
			console.log("Processing", file);
			var html = getMainTemplate(file, true, files);
			await writeToSite("archive", `${file}/index`, html, "html");
		});
	},
	writeIndex: async () => {
		var fileName = "./text/";
		var files = fs.readdirSync(fileName);
		console.log("Current date:", files[files.length - 1]);
		var html = getMainTemplate(files.pop(), null, files);
		return await writeToSite("", "index", html, "html");
	},
};
