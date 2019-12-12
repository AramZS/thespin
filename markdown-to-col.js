var showdown = require("showdown");
var fs = require("fs");

/**
 * date: 1987-10-30
 * colNum: 1 || 2 || 3
 *
 */
const selectCol = (date, colNum) => {
  var fileName = "./text/" + date + "/";
  var files = fs.readdirSync(fileName);
  return fileName+'/'+files[colNum - 1];
};

const convert = function(text) {
  var converter = new showdown.Converter();
  var html = converter.makeHtml(text);
  return html;
};

const process = function(date, colNum) {
  var text = fs.readFileSync(selectCol(date, colNum)).toString();
  // console.log(text);
  return convert(text);
};

module.exports = {
  process
};
