var showdown  = require('showdown');

/** 
 * date: 1987-10-30
 * colNum: 1
 *
 */
const selectCol = (date,colNum) => {
  var fileName = './text/'+date+'/';
  var files 
  return fileName;
}

const process = async function(){
    var converter = new showdown.Converter(),
    text      = '# hello, markdown!',
    html      = converter.makeHtml(text);
}


module.exports = {
  process,
  fromOneMany: fromOneMany
};