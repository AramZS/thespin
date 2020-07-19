const markdownHandler = require("./markdown-to-grid");
const Mustache = require("mustache");
var fs = require("fs");

const getDatagrid = function() {
  var file = fs.readFileSync("./views/datagrid/gridbox.mustache").toString();
  var html = Mustache.render(file, {});
};

const gridOfCards = async function() {
  const gridSet = await markdownHandler.getGridSet();
  let gridBoxes = [];
  const templates = {
    databox: fs.readFileSync("./views/datagrid/databox.mustache").toString()
  };
  Object.keys(gridSet).forEach(function(key, index) {
    // key: the name of the object key
    // index: the ordinal position of the key within the object
    var gridbox = {
      databoxes: gridSet[key].data,
      title: key,
      itemCount: gridSet[key].data.length,
      tags: gridSet[key].tags.join(', ') || ""
    };
    var file = fs.readFileSync("./views/datagrid/gridbox.mustache").toString();
    var html = Mustache.render(file, gridbox, templates);
    gridBoxes.push(html)
  });
};
