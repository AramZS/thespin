const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const dbapter = new FileSync("factions.json");
const db = low(dbapter);

const tables = (tableName) => {
  return db.get(tableName).value()
}

const getFaction = (factionName) => {
  return db.get('factions').find({abrv: factionName}).value()
}

const getFactionClocks = (factionName) => {
  return db.get('factions').find({abrv: factionName}).value().clocks
}

module.exports = {
  db,
  tables,
  getFaction,
  getFactionClocks
};
