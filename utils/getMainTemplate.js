const markdownHandler = require("../markdown-to-col");
const Mustache = require("mustache");
const getMainTemplate = function (db, date, archive, otherFiles) {
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
	site.globalData = require("../data");
	Object.assign(site, markdownHandler.getDateMeta(date));
	var file = fs.readFileSync("./views/handlebars.mst").toString();
	var html = Mustache.render(file, site);
	return html;
};

module.exports = {
	getMainTemplate,
};
