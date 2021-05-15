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
  if(db.get('factions').has({abrv: abrv}).value()){
    return db.get('factions').find({abrv: abrv}).assign({name: factionName}).write()
  } else {
    return { update: false, error: 'Abbreviation not found' }
  }
}

const setFactionAbrv = (factionName, abrv) => {
  if(db.get('factions').has({name: factionName}).value()){
    return db.get('factions').find({name: factionName}).assign({abrv: abrv}).write()
  } else {
    return {update: false, error: 'Faction name not found'}
  }
}

const setFactionClocks = (factionAbrv, clockName, level, type) => {
  if(db.get('factions').has({abrv: factionAbrv}).value()){
    var clock = db.get('factions').find({abrv: factionAbrv}).get('clocks').find({name: clockName}).value()
    
  } else {
    return {update: false, error: 'Faction Abbreviation not found'}
  }
}


module.exports = {
  db,
  tables,
  getFaction,
  getFactionClocks
};
