const fs = require("fs-extra");
const path = require("path");

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

let expandOutFiles = (objectToExport, base = __dirname) => {
	const files = getAllFiles(base);
	for (const file of files) {
		const module = require(file);
		Object.assign(objectToExport, module);
	}
	return objectToExport;
};

let exportObj = {
	getAllFiles,
	expandOutFiles,
};

module.exports = expandOutFiles(exportObj);
