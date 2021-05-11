const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const dbapter = new FileSync("factions.json");
const db = low(dbapter);

const tables = (tableName) => {
  return db.get(tableName).value()
}

const getFactionClocks = (factionName) => {
  return db.get('faction').value()
}

module.exports = {
  db,
  tables
};
