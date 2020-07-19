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
  const datagridFolder = "./text-datagrid/";
  return new Promise((resolve, reject) => {
    fs.readdir(datagridFolder, function(err, filenames) {
      if (err) {
        console.log("could not read folder of datagrid", err);
        resolve(false);
        return;
      } else {
        const data = filenames.map(function(filename) {
          fs.readFile(datagridFolder + filename, "utf-8", function(
            err,
            content
          ) {
            if (err) {
              console.log("could not read file of datagrid", err);
              return;
            } else {
              return convert(content);
            }
          });
        });
        resolve(Promise.all(data));
      }
    });
  });
};

const getGridSet = async function() {
  const data = await getData();
  const gridSet = {};
  data.forEach(dataItem => {
    try {
      if (gridSet.hasOwnProperty(dataItem.topic)) {
        gridSet[dataItem.topic].push(dataItem);
      } else {
        gridSet[dataItem.topic] = [dataItem]
      }
    } catch (e) {
      console.log("Data item missing topic ", e, dataItem);
    }
  });
  return gridSet;
};

module.exports = {
  getGridSet
};
