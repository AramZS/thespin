const markdownHandler = require("./markdown-to-grid");
const Mustache = require("mustache");
var fs = require("fs");

const getDatagrid = function (){
  var file = fs.readFileSync("./views/datagrid/gridbox.mustache").toString();
  var html = Mustache.render(file, {});
}

const gridOfCards = async function(){
  const gridSet = await markdownHandler.getGridSet();
  const templates = {databox: fs.readFileSync("./views/datagrid/databox.mustache").toString() }
  Object.keys(gridSet).forEach(function(key,index) {
    // key: the name of the object key
    // index: the ordinal position of the key within the object 
    var gridbox = { databoxes: gridSet[key], title: key,  }
  });
}

