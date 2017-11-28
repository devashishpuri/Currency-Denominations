var wtf_wikipedia = require("wtf_wikipedia")
var fs = require("fs");

module.exports.init = readCurrnecyList;
module.exports.notes = getNotes;

function readCurrnecyList() {
  fs.readFile('currencyNameMap.json', function (err, data) {
    if (err) {
      return console.error(err);
    }
    let currencyList = JSON.parse(data.toString());
    let currencyNotesMap = {};
    let notFoundList = [];
    for(var currencyName in currencyList) {
      let currency = currencyList[currencyName];
      //let notes = getNotes(currency);
      getNotes(currencyName).then(notes => {
        console.log(currencyName, notes);
        currencyNotesMap[currency] = notes;
        writeCurrencyFile(currencyNotesMap);
      }).catch(e => {
        console.log('ERR', currency, e);
        notFoundList.push(currency);
        fs.writeFile('NotFound.json', JSON.stringify(notFoundList))
      });
      //currencyNotesMap[currency] = await notes;
    }
    writeCurrencyFile(currencyNotesMap);
    //fs.writeFile('currencyNotesMap.json', JSON.stringify(notFoundList))
  });

}

function writeCurrencyFile(map) {
  fs.writeFile('currencyNotesMap.json', JSON.stringify(map),  function(err) {
    if (err) {
      return console.error(err);
    }
  })
}

function getNotes(currency) { 
  //fetch wikipedia markup from api..
  return new Promise( function( resolve, reject) { 
    wtf_wikipedia.from_api(currency, "en", function(markup){
      var obj= wtf_wikipedia.parse(markup);
      var infobox = obj.infobox;
      var notes;

      //CHECK AVAILABLE DATA
      if(!infobox) {
        reject('NOT_FOUND');
        return;
      }
      if(infobox['frequently_used_banknotes']) {
        notes = infobox['frequently_used_banknotes'].text
      }
      else if(infobox['used_banknotes']) {
        notes = infobox['used_banknotes'].text
      } else {
        reject('NOT_FOUND');
        return;
      }
      //FILTER RESULTS IN HR FORMAT
      var notes_arr = (notes.split(',')).map( function(item) {
        console.log('Item', item);
        var arr = item.match(/\d+/g)
        return arr ? arr[0]: null;
      });
      resolve(notes_arr);
      return;
    });

  })

}

readCurrnecyList()
