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
    type: 'lang',
    regex: /headerStart/g,
    replace: 'headerStart'
  };
  var myext2 = {
    type: 'lang',
    regex: /headerEnd/g,
    replace: 'headerEnd'
  };
  var myext3 = {
    type: 'output',
    regex: /<p>headerStart<\/p>/g,
    replace: '<header>'
  };
  var myext4 = {
    type: 'output',
    regex: /<p>headerEnd<\/p>/g,
    replace: '</header>'
  };
    var myext5 = {
    type: 'output',
    regex: /~fiOpen/g,
    replace: '<figure class="figure">'
  };
    var myext6 = {
    type: 'output',
    regex: /~fiClose/g,
    replace: '</figure>'
  };
  return [myext1, myext2, myext3, myext4, myext5, myext6];
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
