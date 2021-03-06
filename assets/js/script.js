// global variables
let jokeList = []; // array holding jokes from https://github.com/15Dkatz/official_joke_api
let triviaList = []; // array holding jokes from // https://jservice.io/
let questionList = []; // array holding the questions and answers that will display to the player

let curQuestionNum; // tracks the current question number
let userScore; // tracks the user's score
let timerInterval; // tracks the timer function - so we can cancel it anywhere
let secondsLeft; // tracks the time remaining in play
let gameName = "joke trivia"; // for high score display

/* Utility functions */
// get the list from local storage - pass in the key to the list we want
let getHighScores = (key) => JSON.parse(localStorage.getItem(key)) || [];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

/* API functions */
// https://jservice.io/
function getTriviaFromAPI() {
  let requestURL = "https://opentdb.com/api.php?amount=10&type=multiple";

  fetch(requestURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // console.log(data);
      triviaList = data.results;
    });
}

// https://github.com/15Dkatz/official_joke_api
function getJokeFromAPI() {
  let requestURL = "https://official-joke-api.appspot.com/random_ten";

  fetch(requestURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      jokeList = data;
    });
}

function createJokeArray() {
  // clear the array from the previous questions
  questionList = [];

  //populate the initial object
  for (let i = 0; i < jokeList.length; i++) {
    questionList.push(getJokeObj(jokeList[i], i));
  }
  // get new list of jokes (so we don't have to deal with async)
  getJokeFromAPI();
}

function createTriviaArray() {
  // clear the array from the previous questions
  questionList = [];

  for (let i = 0; i < triviaList.length; i++) {
    questionList.push(getTriviaObj(triviaList[i]));
  }

  // get new list of trivia (so we don't have to deal with async)
  getTriviaFromAPI();
}

function createJokeTriviaArray() {
  // clear the array from the previous questions
  questionList = [];

  for (let i = 0; i < 10; i++) {
    if (Math.random() < 0.5) {
      questionList.push(getTriviaObj(triviaList[i]));
    } else {
      questionList.push(getJokeObj(jokeList[i], i));
    }
    //
  }
  console.log(questionList);

  // get new lists (so we don't have to deal with async)
  getJokeFromAPI();
  getTriviaFromAPI();
}

/* this will take the joke from the jokeList and format it for the questionList
  joke is the item from the jokeList array
  arrIndex is the current item index in the jokeList */
function getJokeObj(joke, arrIndex) {
  let objQAndA = {
    question: joke.setup,
    suggestedAnswers: [joke.punchline],
    correctAnswer: joke.punchline,
    userChoice: "",
  };

  // get list of answers (arrIndex = correct answer)
  let randomNum;
  let randomNumUsed = [arrIndex];
  for (let i = 1; i < 4; i++) {
    do {
      randomNum = Math.floor(Math.random() * jokeList.length);
    } while (randomNumUsed.includes(randomNum));
    randomNumUsed.push(randomNum);
    objQAndA.suggestedAnswers.push(jokeList[randomNum].punchline);
  }

  shuffleArray(objQAndA.suggestedAnswers);
  return objQAndA;
}

/* this will take the trivia object from the triviaList and format it for the questionList
  trivia is the item from the triviaList array */
function getTriviaObj(trivia) {
  // make incorrect answer list have all answers
  trivia.incorrect_answers.unshift(trivia.correct_answer);

  //populate the initial object
  let objQAndA = {
    question: trivia.question,
    suggestedAnswers: trivia.incorrect_answers,
    correctAnswer: trivia.correct_answer,
    userChoice: "",
  };

  shuffleArray(objQAndA.suggestedAnswers);
  return objQAndA;
}

/* Game play functions */
// show or hide the screen based on the div ID
function showScreen(screenName) {
  let mainScreen = $("#mainScreen");
  let questionScreen = $("#questionScreen ");
  let finalScoreScreen = $("#finalScoreScreen ");
  let highScoreScreen = $("#highScoreScreen ");
  let header = $("#header");

  switch (screenName) {
    case "mainScreen":
      mainScreen.collapse("show");
      questionScreen.collapse("hide");
      finalScoreScreen.collapse("hide");
      highScoreScreen.collapse("hide");
      header.collapse("hide");
      break;
    case "questionScreen":
      mainScreen.collapse("hide");
      questionScreen.collapse("show");
      finalScoreScreen.collapse("hide");
      highScoreScreen.collapse("hide");
      header.collapse("show");
      break;
    case "finalScoreScreen":
      mainScreen.collapse("hide");
      questionScreen.collapse("hide");
      finalScoreScreen.collapse("show");
      highScoreScreen.collapse("hide");
      header.collapse("show");
      break;
    case "highScoreScreen":
      mainScreen.collapse("hide");
      questionScreen.collapse("hide");
      finalScoreScreen.collapse("hide");
      highScoreScreen.collapse("show");
      header.collapse("hide");
      break;
  }
}

function startGame() {
  secondsLeft = 60;
  curQuestionNum = 0;
  userScore = 0;

  $("#timerDisplay").text(secondsLeft);
  $("#scoreDisplay").text(userScore);
  startTimer();

  showScreen("questionScreen");
  generateQuestion();
}

function startTimer() {
  let timeRemaining = $("#timerDisplay");

  // Sets interval in variable
  timerInterval = setInterval(function () {
    secondsLeft--;
    timeRemaining.text(secondsLeft);

    if (secondsLeft === 0) {
      // Stops execution of action at set interval
      clearInterval(timerInterval);
      // Calls function to create and append image
      gameOver();
    }
  }, 1000);
}

function generateQuestion() {
  //clears content of question screen, so multiple question screens don't display when you play again
  $("#questionScreen").text("");

  //grabs question from our array and creates elements dynamically to display the questions and answers
  let currentQuestion = $("<div>").addClass("current-question h2");
  // had to do html instead of text since some of the questions come back with html codes in them
  currentQuestion.html(questionList[curQuestionNum].question);
  $("#questionScreen").append(currentQuestion);
  let currentList = $("<ul>").addClass("answer-list h3 list-group");

  //create a list element for each answer and append it to the question
  for (
    let i = 0;
    i < questionList[curQuestionNum].suggestedAnswers.length;
    i++
  ) {
    let currentAnswer = $("<li>").addClass("current-answer list-group-item");
    // had to do html instead of text since some of the answers come back with html codes in them
    currentAnswer.html(questionList[curQuestionNum].suggestedAnswers[i]);
    $(currentList).append(currentAnswer);
  }

  $("#questionScreen").append(currentList);
  //add event listener on the answers
  $(currentList).children().on("click", checkAnswer);
}

function checkAnswer() {
  //capture the text content of the answer the user clicked on
  let userAnswer = this.textContent;

  //check if answer is correct and add to user score
  if (userAnswer === questionList[curQuestionNum].correctAnswer) {
    userScore++;
    $("#scoreDisplay").text(userScore);
  }

  curQuestionNum++;
  // go to next question if there are more questions left, otherwise move to game over screen
  if (curQuestionNum < questionList.length) {
    generateQuestion();
  } else {
    gameOver();
  }
}

function gameOver() {
  //display game over screen
  //display high score input
  clearInterval(timerInterval);
  console.log("gameOver");
  showScreen("finalScoreScreen");
  getInitials();
}

function getInitials() {
  //clear content of final score screen, so that multiple final score screens don't display when playing again
  $("#finalScoreScreen").text("");
  //creating and appending elements to display the users final score and time and an input box to capture the user initials
  let formContainer = $("<div>").addClass("gameOverForm");
  $("#finalScoreScreen").append(formContainer);
  $(formContainer).append(
    "<h1><img class='game-over' src='./assets/images/game-over.png'></h1>"
  );
  let finalScoreHeader = $("<h2>");
  finalScoreHeader.text("Final Score: " + userScore);
  let timeLeft = $("<h2>");
  timeLeft.text("Time Left: " + secondsLeft + " seconds");
  $(formContainer).append(timeLeft);
  $(formContainer).append(finalScoreHeader);
  $(finalScoreHeader).append("<form id='initial-form'></form>");
  $("#initial-form").append(
    "<label for='initial-input'>Enter Your Initials:</label>"
  );
  $("#initial-form").append(
    "<input type='text' name='initial-input' class='ms-2'>"
  );
  $("#initial-form").append(
    "<button class='btn btn-dark btn-lg ms-3' id='btnSubmit'>Submit Score</button>"
  );
  //event listener on the submit button that calls the storeHighScore function
  $("#initial-form").on("submit", function (event) {
    storeHighScore(event);
  });
}

function storeHighScore(event) {
  event.preventDefault();
  //set up object to store user initials from input form, user score and seconds left from a global variable
  let scoreList = getHighScores(gameName);
  let scoreObject = {
    name: $("#initial-form input").val(),
    score: userScore,
    time: secondsLeft,
  };
  //add object to array of scores
  scoreList.unshift(scoreObject);

  //sort score array in descending order
  scoreList.sort(function (a, b) {
    return b.score - a.score;
  });
  //set score list to ten, only displaying top ten scores, but also allow scoreLists that are shorter than ten
  if (scoreList.length > 10) {
    scoreList.length = 10;
  }

  //convert score object into a string and then store it in local storage
  localStorage.setItem(gameName, JSON.stringify(scoreList));
  showHighScores();
}

function showHighScores() {
  // clear the old screen and display it again
  $("#highScoreScreen").text("");
  showScreen("highScoreScreen");

  // set up container to store the logo and screen's title in
  let highScoreDiv = $("<div>")
    .attr("id", "highScore-header")
    .addClass("text-white")
    .addClass("d-flex flex-column");

  let logo = $("<img>")
    .addClass("logo")
    .attr("id", "highScore-logo")
    .attr("src", "./assets/images/joke-trivia-logo-whitebg.png")
    .attr("alt", "Joke Trivia");
  let highScoreH1 = $("<h1>").addClass("highScore-text").text("High Scores");
  let imgContainer = $("<div>").addClass("mx-auto");

  imgContainer.append(logo);
  highScoreDiv.append(imgContainer);
  highScoreDiv.append(highScoreH1);
  $("#highScoreScreen").append(highScoreDiv);

  // create the tabs
  let tabList = $("<ul>")
    .addClass("nav nav-tabs nav-justified")
    .attr("id", "highScore-tabs")
    .attr("role", "tablist");

  // add tab names
  let jokeTab = $("<li>").addClass("nav-item").attr("role", "presentation");
  let jokeTriviaTab = $("<li>")
    .addClass("nav-item")
    .attr("role", "presentation");
  let triviaTab = $("<li>").addClass("nav-item").attr("role", "presentation");

  // add links to the tab that will display when clicked (these are to divs)
  let jokeTabLink = $("<button>")
    .addClass("nav-link")
    .attr("id", "jokeTable-tab")
    .attr("data-bs-toggle", "tab")
    .attr("data-bs-target", "#jokeTable")
    .attr("type", "button")
    .attr("role", "tab")
    .attr("aria-controls", "jokeTable")
    // .attr("aria-selected", "false") <---- set when selecting active panel
    .text("Joke Trivia");

  let jokeTriviaTabLink = $("<button>")
    .addClass("nav-link")
    .attr("id", "jokeTriviaTable-tab")
    .attr("data-bs-toggle", "tab")
    .attr("data-bs-target", "#jokeTriviaTable")
    .attr("type", "button")
    .attr("role", "tab")
    .attr("aria-controls", "jokeTriviaTable")
    // .attr("aria-selected", "false") <---- set when selecting active panel
    .text("Jokes & Trivia");

  let triviaTabLink = $("<button>")
    .addClass("nav-link")
    .attr("id", "triviaTable-tab")
    .attr("data-bs-toggle", "tab")
    .attr("data-bs-target", "#triviaTable")
    .attr("type", "button")
    .attr("role", "tab")
    .attr("aria-controls", "triviaTable")
    // .attr("aria-selected", "false") <---- set when selecting active panel
    .text("Trivia Trivia");

  // add links to the tabs and tabs to the list
  jokeTab.append(jokeTabLink);
  jokeTriviaTab.append(jokeTriviaTabLink);
  triviaTab.append(triviaTabLink);

  tabList.append(jokeTab);
  tabList.append(jokeTriviaTab);
  tabList.append(triviaTab);

  // add content divs
  let tabContent = $("<div>");
  tabContent.addClass("tab-content");

  let jokeDiv = $("<div>")
    .addClass("tab-pane fade")
    .attr("id", "jokeTable")
    .attr("role", "tabpanel")
    .attr("aria-labelledby", "jokeTable-tab");

  let jokeDivContent = $("<div>").addClass(
    "bg-light border rounded-bottom d-flex justify-content-center"
  );

  let jokeTriviaDiv = $("<div>")
    .addClass("tab-pane fade")
    .attr("id", "jokeTriviaTable")
    .attr("role", "tabpanel")
    .attr("aria-labelledby", "jokeTriviaTable-tab");

  let jokeTriviaDivContent = $("<div>").addClass(
    "bg-light border rounded-bottom d-flex justify-content-center"
  );

  let triviaDiv = $("<div>")
    .addClass("tab-pane fade")
    .attr("id", "triviaTable")
    .attr("role", "tabpanel")
    .attr("aria-labelledby", "triviaTable-tab");

  let triviaDivContent = $("<div>").addClass(
    "bg-light border rounded-bottom d-flex justify-content-center"
  );

  // add content to the divs and divs to the container
  jokeDivContent.append(getTable(getHighScores("joke trivia")));
  jokeTriviaDivContent.append(getTable(getHighScores("joke and trivia")));
  triviaDivContent.append(getTable(getHighScores("trivia trivia")));

  jokeDiv.append(jokeDivContent);
  jokeTriviaDiv.append(jokeTriviaDivContent);
  triviaDiv.append(triviaDivContent);

  tabContent.append(jokeDiv);
  tabContent.append(jokeTriviaDiv);
  tabContent.append(triviaDiv);

  // select active tab and div based off of last game played
  if (gameName === "trivia trivia") {
    triviaTabLink.addClass("active").attr("aria-selected", "true");
    triviaDiv.addClass("show active");
  } else if (gameName === "joke and trivia") {
    jokeTriviaTabLink.addClass("active").attr("aria-selected", "true");
    jokeTriviaDiv.addClass("show active");
  } else {
    jokeTabLink.addClass("active").attr("aria-selected", "true");
    jokeDiv.addClass("show active");
    // triviaTabLink.removeClass("active").attr("aria-selected", "false"); <-- not needed since we clear everything between displays
    // triviaDiv.removeClass("show active");
  }

  // add Play Again button
  let playAgain = $("<button>");
  playAgain.text("Play Again");
  playAgain.addClass("btn btn-light btn-lg mt-3");
  playAgain.on("click", function () {
    showScreen("mainScreen");
  });

  // add everything to the page
  $("#highScoreScreen").append(tabList);
  $("#highScoreScreen").append(tabContent);
  $("#highScoreScreen").append(playAgain);
}

// takes in an array and returns a jQuery table object
function getTable(arrData) {
  let table = $("<table>");
  table.addClass("table table-bordered m-4");

  // -1 is the table header
  for (let i = -1; i < arrData.length; i++) {
    let tr = $("<tr>");
    let name;
    let score;
    let time;
    if (i < 0) {
      name = $("<th>").text("Name");
      score = $("<th>").text("Score");
      time = $("<th>").text("Time");
    } else {
      name = $("<td>").text(arrData[i].name);
      score = $("<td>").text(arrData[i].score);
      time = $("<td>").text(arrData[i].time);
    }
    tr.append(name);
    tr.append(score);
    tr.append(time);
    table.append(tr);
  }

  return table;
}

/* page load and start functions */
$(document).ready(function () {
  // call the API functions right away so we don't have to wait for the values
  getJokeFromAPI();
  getTriviaFromAPI();

  // ensure the mainScreen is what is displayed
  showScreen("mainScreen");
});

// add event listeners to the buttons on the homepage
$("#btnJoke").on("click", function () {
  gameName = "joke trivia";
  createJokeArray();
  startGame();
});

$("#btnJokeTrivia").on("click", function () {
  gameName = "joke and trivia";
  createJokeTriviaArray();
  startGame();
});

$("#btnTrivia").on("click", function () {
  gameName = "trivia trivia";
  createTriviaArray();
  startGame();
});

$("#btnHighScore").on("click", function () {
  showHighScores();
});
