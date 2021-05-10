const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const dgadapter = new FileSync("factions.json");
const dgdb = low(dgadapter);



module.exports = {
  
};
