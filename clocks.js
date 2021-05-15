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
const setFactionName = (factionName, abrv) => {
  if(db.get('factions').has(factionName).value()){
    return db.get('factions').find({abrv: abrv}).update('name', factionName).write()
  } else {
    return false
  }
}

const setFactionAbrv = (factionName, abrv) => {
  if(db.get('factions').has(factionName).value()){
    return db.get('factions').find({name: factionName}).update('abrv', factionName).write()
  } else {
    return false
  }
}

const setFactionClocks = (factionName, clockName, level, type) => {
  if(db.get('factions').has(factionName).value()){
    
  } else {
    return false
  }
}


module.exports = {
  db,
  tables,
  getFaction,
  getFactionClocks
};
