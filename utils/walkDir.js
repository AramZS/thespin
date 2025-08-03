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

module.exports = {
	walkDir,
};
