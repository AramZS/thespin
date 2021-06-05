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
const appendNewCharacter = function (character) {
  var buttonText = "Select This Role";
  if (character.player && character.player.length > 0) {
    buttonText = "Selected By " + character.player;
  }
  var characterBio = `<div class="char selected_${character.selected}" augmented-ui="tl-clip br-clip exe"><li><b>Type</b>: ${character.name}</li><li><b>Bio</b>: ${character.brief}</li><li><a href="${character.url}" target="_blank">See the Full Description</a></li><button type="submit" id="${character.id}" onclick="fnSubmitForm(this);">${buttonText}</button> </div>`;
  const newListItem = document.createElement("li");
  newListItem.innerHTML = characterBio;
  charList.appendChild(newListItem);
  if (character.player && character.player.length > 0) {
    document.getElementById(character.id).disabled = true;
  }
};

// iterate through every dream and add it to our page

// listen for the form to be submitted and add a new dream when it is
charForm.onsubmit = function (event) {
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
  selectCharacter(button.id, userName);
}

function setUpAPIRequest(aMethod, url) {
  var theUrl = "";
  var theMethod = "GET";
  if (location.href.match(/github/g)) {
    var theUrl = "https://aramzs.github.io/thespin/json/" + url + ".json";
  } else {
    var theUrl = "https://thespin.glitch.me/" + url;
    theMethod = aMethod;
  }
  var xhr = new XMLHttpRequest(),
    method = theMethod,
    url = theUrl;

  xhr.open(method, url, true);
  if (theMethod !== "GET") {
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  }
  return xhr;
}

const selectCharacter = function (charId, user) {
  var xhr = setUpAPIRequest("POST", "character/" + encodeURIComponent(charId));
  /**
  var xhr = new XMLHttpRequest(),
      method = "POST",
      url = 'https://thespin.glitch.me/'+"character/"+encodeURIComponent(charId);
      xhr.open(method, url, true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  **/
  console.log();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var jsonObj = JSON.parse(xhr.responseText);
      console.log(jsonObj);
      if (jsonObj.result == false) {
        window.alert("Someone has already claimed that character");
      } else {
        // window.alert("You have selected a character!");
        window.alert("We are not accepting new applicants.");
        document.getElementById(charId).disabled = true;
        var buttonText = "Selected By " + user;
        document.getElementById(charId).innerHTML = buttonText;
      }
    }
  };
  xhr.send(JSON.stringify({ user: user }));
};

var getCharacters = function () {
  try {
    var xhr = setUpAPIRequest("GET", "characters");
    /**
  var xhr = new XMLHttpRequest(),
      method = "GET",
      url = 'https://thespin.glitch.me/'+"characters/";
  
  xhr.open(method, url, true);
  **/
    console.log("GET Characters");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var jsonObj = JSON.parse(xhr.responseText);
        console.log(jsonObj);
        jsonObj.forEach(function (characterObj) {
          appendNewCharacter(characterObj);
        });
        if (jsonObj.result == false) {
          window.alert("All the base belong to someone else");
        }
      }
    };
    xhr.send();
  } catch (e) {
    console.log(e);
    window.alert("We can not reach the server. Are you sure you are on HTTPS?");
  }
};

window.openLetter = function () {
  var container = document.getElementById("letter-notifications");
  if (container) {
    var isOpen = container.getAttribute("data-open");
    if (isOpen != "true") {
      console.log("open letter box");
      document.getElementById("letter-notifications").style =
        "transform: scale(1,1)";
      container.setAttribute("data-open", "true");
    } else {
      container.setAttribute("data-open", "false");
      document.getElementById("letter-notifications").style =
        "transform: scale(0,0)";
    }
  }
};

window.activateLetter = function (el) {
  try {
    var container = document.getElementsByClassName(el.value)[0];
    var isOpen = container.getAttribute("data-open");
    var list = document.getElementsByClassName("mystery-letter");
    for (var i = 0; i < list.length; i++) {
      if (list[i].className !== container.className) {
        list[i].setAttribute("data-open", "false");
        list[i].style = "display: none; transform: scale(0,0);";
      }
    }
    console.log("open letter", container);
    container.style = "display: block; transform: scale(1,1);";
    container.setAttribute("data-open", "true");
  } catch (e) {
    var list = document.getElementsByClassName("mystery-letter");
    for (var i = 0; i < list.length; i++) {
      list[i].setAttribute("data-open", "false");
      list[i].style = "display: none; transform: scale(0,0);";
    }
  }
};

window.getCharacters = getCharacters;

window.getWeekDay = function (date) {
  //Create an array containing each day, starting with Sunday.
  var weekdays = new Array(
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  );
  //Use the getDay() method to get the day.
  var day = date.getDay();
  //Return the element that corresponds to that index.
  return weekdays[day];
};

function getDateline() {
  const aDay = document.getElementById("the-dateline");
  console.log("aDay", aDay);
  return aDay.getAttribute("data-date");
}

function getDatelineString(dateline) {
  var options = { month: "long" };
  try {
    var dateIs = new Date(dateline + " 12:00 pm");
    var month = new Intl.DateTimeFormat("en-US", options).format(dateIs);
  } catch (e) {
    var dateString = dateline;
    dateString.split('-')
    var dateArray = [dateString.split('-')[1], dateString.split('-')[2], dateString.split('-')[0]]
    console.log('Date is try 2 ', dateArray.join(' '))
    var dateIs = new Date(dateArray.join(' ') + " 12:00 pm");
    var month = new Intl.DateTimeFormat("en-US", options).format(dateIs);
  }
  console.log("date is", dateIs);

  var day = window.getWeekDay(dateIs);
  var year = dateIs.getFullYear();
  var date = dateIs.getDate();
  return { day: day, month: month, date: date, year: year }; // `<span class='the-day'>${day}</span> ${month} ${date}, ${year}`
}

function fillDay() {
  console.log(fillDay);
  const aDay = document.getElementById("the-dateline");
  let topLine = "";
  if (aDay.innerHTML.length > 1) {
    topLine = aDay.innerHTML;
  }
  var currentDateStringObj = getDatelineString(getDateline())
  console.log(
    `The Enclave - <span class='the-day'>${currentDateStringObj.day}</span> ${currentDateStringObj.month} ${currentDateStringObj.date}, ${currentDateStringObj.year}`
  );
  var dateSelector = '';
  if (window.pastDays) {
    var dateStrings = [];
    window.pastDays.forEach((oldDate) => {
      var aDateLine = getDatelineString(oldDate)
      dateStrings.push(`${aDateLine.day} ${aDateLine.month} ${aDateLine.date}, ${aDateLine.year}`)
    })
  }
  aDay.innerHTML =
    `The Enclave - <span class='the-day'>${currentDateStringObj.day}</span> ${currentDateStringObj.month} ${currentDateStringObj.date}, ${currentDateStringObj.year} <br />` +
    '<a id="notification-container" onclick="window.openLetter">' +
    topLine +
    "</a>";
  aDay.onclick = window.openLetter;
}

fillDay();

const setColHTML = function (colNum, col) {
  try {
    const aDay = getDateline();
    var xhr = setUpAPIRequest("GET", "text/" + aDay + "/" + colNum);
    /** 
    var xhr = new XMLHttpRequest(),
      method = "GET",
      url = "https://thespin.glitch.me/" + "text/" + aDay + "/" + colNum;
    console.log("GET colHTML");
    xhr.open(method, url, true);
    **/
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var jsonObj = JSON.parse(xhr.responseText);
        console.log(jsonObj);
        col.innerHTML = jsonObj.data;
        if (jsonObj.result == false) {
          window.alert("All the base belong to someone else");
        }
      }
    };
    xhr.send();
  } catch (e) {
    console.log(e);
    window.alert("We can not reach the server. Are you sure you are on HTTPS?");
  }
};

window.fillHTMLCols = function () {
  var colNum = 1;
  var columns = document.querySelectorAll(".column .colInner");
  columns.forEach(function (col) {
    setColHTML(colNum++, col);
  });
};
