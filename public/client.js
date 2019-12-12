// client-side js
// run by the browser each time your view template is loaded

console.log("hello world :o");

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// define variables that reference elements on our page
const charList = document.getElementById("select-class-list");
const charForm = document.forms[0];
const nameInput = document.getElementById("submit-name");

// a helper function that creates a list item for a given dream
const appendNewCharacter = function(character) {
  var buttonText = "Select This Role";
  if (character.player && character.player.length > 0){
    buttonText = "Selected By "+ character.player;
  }
  var characterBio = `<div class="char selected_${character.selected}" augmented-ui="tl-clip br-clip exe"><li><b>Type</b>: ${character.name}</li><li><b>Bio</b>: ${character.brief}</li><li><a href="${character.url}" target="_blank">See the Full Description</a></li><button type="submit" id="${character.id}" onclick="fnSubmitForm(this);">${buttonText}</button> </div>`;
  const newListItem = document.createElement("li");
  newListItem.innerHTML = characterBio;
  charList.appendChild(newListItem);
  if (character.player && character.player.length > 0){
    document.getElementById(character.id).disabled = true;
  }
};

// iterate through every dream and add it to our page

// listen for the form to be submitted and add a new dream when it is
charForm.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();

  // get dream value and add it to the list
  var userName = nameInput.value;
  console.log(event);
  //appendNewDream(dreamInput.value);
  // reset form
  // selectCharacter()
};

function fnSubmitForm(button) {

  // get dream value and add it to the list
  var userName = nameInput.value;
  console.log(button.id, userName);
  //appendNewDream(dreamInput.value);
  // reset form
  selectCharacter(button.id, userName)
};

const selectCharacter = function(charId, user) {
  var xhr = new XMLHttpRequest(),
      method = "POST",
      url = 'https://thespin.glitch.me/'+"character/"+encodeURIComponent(charId);
  console.log();
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if(xhr.readyState === 4 && xhr.status === 200) {
      var jsonObj = JSON.parse(xhr.responseText);
      console.log(jsonObj);
      if (jsonObj.result == false){
        window.alert('Someone has already claimed that character');
      } else {
        window.alert('You have selected a character!');
        document.getElementById(charId).disabled = true;
        var buttonText = "Selected By "+ user;
        document.getElementById(charId).innerHTML = buttonText;
      }
    }
  };
  xhr.send(JSON.stringify({user: user}));
}

var getCharacters = function() {
  try {
  var xhr = new XMLHttpRequest(),
      method = "GET",
      url = 'https://thespin.glitch.me/'+"characters/";
  console.log('GET Characters');
  xhr.open(method, url, true);
  xhr.onreadystatechange = function () {
    if(xhr.readyState === 4 && xhr.status === 200) {
      var jsonObj = JSON.parse(xhr.responseText);
      console.log(jsonObj);
      jsonObj.forEach(function(characterObj){
        appendNewCharacter(characterObj);
      })
      if (jsonObj.result == false){
        window.alert('All the base belong to someone else')
      }
    }
  };
  xhr.send();
  } catch (e){
    console.log(e);
    window.alert('We can not reach the server. Are you sure you are on HTTPS?')
  }
}

window.getCharacters = getCharacters;

window.getWeekDay = function(date){
    //Create an array containing each day, starting with Sunday.
    var weekdays = new Array(
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    );
    //Use the getDay() method to get the day.
    var day = date.getDay();
    //Return the element that corresponds to that index.
    return weekdays[day];
}

function getDateline(){
  const aDay = document.getElementById('the-dateline');
  return aDay.getAttribute('data-date');
}

function fillDay(){
  console.log(fillDay);
  const aDay = document.getElementById('the-dateline');
  var dateIs = new Date(getDateline());
  var options = { month: 'long'};
  var month = new Intl.DateTimeFormat('en-US', options).format(dateIs);
  var day = window.getWeekDay(dateIs);
  var year = dateIs.getFullYear();
  var date = dateIs.getDate();
  console.log(`The Enclave - <span id='the-day'>${day}</span> ${month} ${date}, ${month}`);
  aDay.innerHTML = `The Enclave - <span id='the-day'>${day}</span> ${month} ${date}, ${month}`;
}

fillDay();


const setColHTML = function(colNum, col) {
  try {
  const aDay = getDateline();
  var xhr = new XMLHttpRequest(),
      method = "GET",
      url = 'https://thespin.glitch.me/'+"text/"+aDay+'/'+colNum;
  console.log('GET colHTML');
  xhr.open(method, url, true);
  xhr.onreadystatechange = function () {
    if(xhr.readyState === 4 && xhr.status === 200) {
      var jsonObj = JSON.parse(xhr.responseText);
      console.log(jsonObj);
      col.innerHTML = jsonObj.data
      if (jsonObj.result == false){
        window.alert('All the base belong to someone else')
      }
    }
  };
  xhr.send();
  } catch (e){
    console.log(e);
    window.alert('We can not reach the server. Are you sure you are on HTTPS?')
  }
}

window.fillHTMLCols = function(col){
  var colNum = 1;
  var columns = document.querySelectorAll(".collumn");
  columns.forEach(function(col){
    setColHTML(colNum++, col);
  });
}