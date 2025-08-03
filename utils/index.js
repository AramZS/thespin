const fs = require("fs-extra");
const path = require("path");

let exportObj = {};

// walk through a directory and return all files
function getAllFiles(dir) {
	const files = fs.readdirSync(dir);
	const allFiles = [];
	for (const file of files) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			const nestedFiles = getAllFiles(filePath);
			allFiles.push(...nestedFiles);
		} else {
			if (file.match(/\.js$/)) {
				allFiles.push(filePath);
			}
		}
	}
	return allFiles;
}

// walk through this directory and import all the files to a parent object
const files = getAllFiles(__dirname);
for (const file of files) {
	const module = require(file);
	Object.assign(exportObj, module);
}
module.exports = exportObj;
