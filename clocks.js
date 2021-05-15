const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const dbapter = new FileSync("factions.json");
const db = low(dbapter);


// All
const tables = (tableName) => {
  return db.get(tableName).value()
}

// Gets
const getFaction = (factionName) => {
  return db.get('factions').find({abrv: factionName}).value()
}

const getFactionClocks = (factionName) => {
  return db.get('factions').find({abrv: factionName}).value().clocks
}

// Sets
const setFaction = (factionName) => {
  return db.get('factions').find({abrv: factionName}).value()
}

const setFactionClocks = (factionName) => {
  return db.get('factions').find({abrv: factionName}).value().clocks
}


module.exports = {
  db,
  tables,
  getFaction,
  getFactionClocks
};
