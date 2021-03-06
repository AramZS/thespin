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
const setFaction = (factionName, abrv) => {
  if(db.get('factions').find({abrv: abrv}).value() || db.get('factions').find({name: factionName}).value()){
    return {
      update: false,
      error: 'Faction exists'
    }
  } else {
    return { update: true, result: db.get('factions').push({
      name: factionName,
      abrv,
      clocks: []
    }).write() }
  }
}

const setFactionName = (factionName, abrv) => {
  if(db.get('factions').find({abrv: abrv}).value()){
    return {
      update: true,
      result: db.get('factions').find({abrv: abrv}).assign({name: factionName}).write()
    }
  } else {
    return { update: false, error: 'Abbreviation not found' }
  }
}

const setFactionAbrv = (factionName, abrv) => {
  if(db.get('factions').has({name: factionName}).value()){
    return {
      update: true,
      result: db.get('factions').find({name: factionName}).assign({abrv: abrv}).write()
    }
  } else {
    return {update: false, error: 'Faction name not found'}
  }
}

const setFactionClocks = (factionAbrv, clockName, level, type) => {
  if(db.get('factions').find({abrv: factionAbrv}).value()){
    var clock = db.get('factions').find({abrv: factionAbrv}).get('clocks').find({name: clockName}).value()
    if (clock){
      clock.level = level ? level : clock.level
      clock.type = type ? type : clock.type
      return { 
                update: true, 
                result: db.get('factions').find({abrv: factionAbrv}).get('clocks').find({name: clockName}).update(clock).write()
             }
    } else {
      clock = {
        name: clockName,
        level,
        type
      }
      return {
        update: true, 
        result: db.get('factions').find({abrv: factionAbrv}).get('clocks').push(clock).write()
      }
    }
  } else {
    return {update: false, error: 'Faction Abbreviation not found'}
  }
}


module.exports = {
  db,
  tables,
  getFaction,
  getFactionClocks,
  setFaction,
  setFactionName,
  setFactionAbrv,
  setFactionClocks
};
