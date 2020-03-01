var showdown = require("showdown");
var fs = require("fs");
// var md = require('markdown-it')();

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
    replace: '<header class="head">'
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
    var myext7 = {
    type: 'output',
    regex: /<p>pqStart<\/p>/g,
    replace: '<span class="citation">'
  };
    var myext8 = {
    type: 'output',
    regex: /<p>pqEnd<\/p>/g,
    replace: '</span>'
  };
  return [myext1, myext2, myext3, myext4, myext5, myext6, myext7, myext8];
}

const convert = function(text, toMetadata) {
  // showdown.extension('myext', myext);
  var converter = new showdown.Converter({
    strikethrough: true,
    simpleLineBreaks: false,
    extensions: [myext],
    tasklists: true,
    metadata: true
  });
  converter.setFlavor('original');
  // var html = md.render(text);
  var html = converter.makeHtml(text);
  var metadata = converter.getMetadata();
  console.log('Article metadata', metadata);
  if (toMetadata === true){
    return metadata;
  }
  return html;
};

const getDateMeta = function(date){
    var text = fs.readFileSync(selectCol(date, 1)).toString();
  // console.log(text);
  return convert(text, true);
}

const process = function(date, colNum) {
  var text = fs.readFileSync(selectCol(date, colNum)).toString();
  // console.log(text);
  return convert(text);
};

module.exports = {
  process,
  getDateMeta
};
