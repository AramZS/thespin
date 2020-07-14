var showdown = require("showdown");
var fs = require("fs");
// var md = require('markdown-it')();

const convert = function(text, toMetadata) {
  // showdown.extension('myext', myext);
  var converter = new showdown.Converter({
    strikethrough: true,
    simpleLineBreaks: false,
    tasklists: true,
    metadata: true
  });
  converter.setFlavor('original');
  // var html = md.render(text);
  var html = converter.makeHtml(text);
  var metadata = converter.getMetadata();
  return { metadata, html };
};