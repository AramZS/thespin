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
const dreamsForm = document.forms[0];
const dreamInput = dreamsForm.elements["dream"];

// a helper function that creates a list item for a given dream
const appendNewCharacter = function(character) {
  var characterBio = `<div class="char selected_${character.selected}" augmented-ui="tl-clip br-clip exe"><li>Name: ${character.name}</li><li>Bio: ${character.brief}</li><li><a href="${character.url}" target="_blank">See the Full Description</a></li><button type="submit" id="select_${character.id}">Select This Role</button> </div>`;
  const newListItem = document.createElement("li");
  newListItem.innerHTML = characterBio;
  charList.appendChild(newListItem);
};

// iterate through every dream and add it to our page
dreams.forEach(function(dream) {
  //appendNewDream(dream);
});

// listen for the form to be submitted and add a new dream when it is
dreamsForm.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();

  // get dream value and add it to the list
  dreams.push(dreamInput.value);
  //appendNewDream(dreamInput.value);
  // reset form
  dreamInput.value = "";
  dreamInput.focus();
};


const selectCharacter = function(charId) {
  var xhr = new XMLHttpRequest(),
      method = "POST",
      url = 'https://thespin.glitch.me/'+"character/"+encodeURIComponent(charId);
  console.log();
  xhr.open(method, url, true);
  xhr.onreadystatechange = function () {
    if(xhr.readyState === 4 && xhr.status === 200) {
      var jsonObj = JSON.parse(xhr.responseText);
      console.log(jsonObj);
      if (jsonObj.result == false){
        window.alert('Someone has already claimed that character')
      }
    }
  };
  xhr.send();
}

const getCharacters = function() {
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
}


getCharacters();