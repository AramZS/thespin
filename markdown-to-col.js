var showdown = require("showdown");
var fs = require("fs");
var md = require('markdown-it')();

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

const myext = function () {
  var myext1 = {
    type: 'output',
    regex: /headerStart/g,
    replace: '<header>'
  };
  var myext2 = {
    type: 'output',
    regex: /headerEnd/g,
    replace: '</header>'
  };
  return [myext1, myext2];
}

const convert = function(text) {
  // showdown.extension('myext', myext);
  var converter = new showdown.Converter({
    strikethrough: true,
    simpleLineBreaks: false,
    extensions: [myext]
  });
  converter.setFlavor('original');
  // var html = md.render(text);
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
