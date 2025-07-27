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
	fs.writeFile(fileTarget, JSON.stringify(data), (err) => {
		// throws an error, you could also catch it here
		if (err) {
			console.log("File Write Error", err);
		}

		// success case, the file was saved
		console.log("JSON file saved saved!");
	});
	return data;
};

var writeJsonToSite = async function (path, data) {
	return await writeToSite("json", path, data, "json");
};

var writeTextDataToSite = async function (path, data) {
	return await writeToSite("text", path, data, "json");
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
	buildGrid: async () => {
		let grid = await gridHandler.getDatagrid();
		return fs.writeFileSync("./_site/grid.html", grid, "utf8");
	},
	copyPublic: () => {
		return fs.copySync("./public", "./_site/public");
	},
	writeCharacters: () => {
		return writeJsonToSite("characters", db.get("characters").value());
	},
	writeCols: async () => {
		const buildFiles = walkDir("./docs/json/text");
		for (const dir of buildFiles) {
			console.log("Processing", dir);
			const filepath = dir.split("/");
			const filename =
				filepath[filepath.length - 2] +
				"/" +
				filepath[filepath.length - 1].replace(".json", "");
			const json = fs.readFileSync(dir);
			const data = JSON.parse(json);
			console.log("Writing", filename);
			await writeTextDataToSite(filename, data);
		}
		return true;
	},
};
