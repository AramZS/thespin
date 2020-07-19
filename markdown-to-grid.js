var showdown = require("showdown");
var fs = require("fs");
// var md = require('markdown-it')();

const convert = function(text) {
  // showdown.extension('myext', myext);
  var converter = new showdown.Converter({
    strikethrough: true,
    simpleLineBreaks: false,
    tasklists: true,
    metadata: true
  });
  converter.setFlavor("original");
  // var html = md.render(text);
  var html = converter.makeHtml(text);
  var metadata = converter.getMetadata();
  return { metadata, html };
};

const getData = function() {
  const datgridFolder = "./text-datagrid/";
  return new Promise((resolve, reject) => {
  fs.readdir(datgridFolder, function(err, filenames) {
    if (err) {
      console.log("could not read folder of datagrid", err);
      resolve(false)
      return;
    } else {
      const data = filenames.map(function(filename) {
        fs.readFile(datgridFolder + filename, "utf-8", function(err, content) {
          if (err) {
            console.log("could not read file of datagrid", err);
            return;
          }
          return (convert(content));
        });
      });
      resolve(data);
    }
  });
  });
};
