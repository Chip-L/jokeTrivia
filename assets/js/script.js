let jokeList = [];
let triviaList = [];
let questionList = [];
let curQuestionNum;
let userScore;
let secondsLeft;
let gameName = "joke trivia"; // for high score display
let timerInterval;

// get the list from local storage - pass in the key to the list we want
let getHighScores = (key) => JSON.parse(localStorage.getItem(key)) || [];

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
      // console.log(data);
      jokeList = data;
      // console.log(jokeList);
    });
}

function generateQuestion() {
  $("#questionScreen").text("");

  let currentQuestion = $("<div>").addClass("current-question h2");
  currentQuestion.text(questionList[curQuestionNum].question);
  $("#questionScreen").append(currentQuestion);
  let currentList = $("<ul>").addClass("answer-list h3 list-group");

  for (
    let i = 0;
    i < questionList[curQuestionNum].suggestedAnswers.length;
    i++
  ) {
    let currentAnswer = $("<li>").addClass("current-answer list-group-item");
    currentAnswer.text(questionList[curQuestionNum].suggestedAnswers[i]);
    $(currentList).append(currentAnswer);
  }
  $("#questionScreen").append(currentList);
  $(currentList).children().on("click", checkAnswer);
}

function checkAnswer() {
  let userAnswer = this.textContent;
  if (userAnswer === questionList[curQuestionNum].correctAnswer) {
    userScore++;
  }
  curQuestionNum++;
  // console.log(curQuestionNum);
  if (curQuestionNum < questionList.length) {
    generateQuestion();
  } else {
    gameOver();
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function createJokeArray() {
  // clear the array from the previous questions
  questionList = [];

  //populate the initial object
  for (let i = 0; i < jokeList.length; i++) {
    let objQAndA = {
      question: jokeList[i].setup,
      suggestedAnswers: [jokeList[i].punchline],
      correctAnswer: jokeList[i].punchline,
      userChoice: "",
    };

    // get list of answers (i = correct answer)
    let randomNum;
    let randomNumUsed = [i];
    for (let j = 1; j < 4; j++) {
      do {
        randomNum = Math.floor(Math.random() * jokeList.length);
      } while (randomNumUsed.includes(randomNum));
      randomNumUsed.push(randomNum);
      objQAndA.suggestedAnswers.push(jokeList[randomNum].punchline);
    }

    shuffleArray(objQAndA.suggestedAnswers);
    questionList.push(objQAndA);
  }
  // get new list of jokes (so we don't have to deal with async)
  getJokeFromAPI();
  // console.log(questionList);
}

function createTriviaArray() {
  // clear the array from the previous questions
  questionList = [];

  for (let i = 0; i < triviaList.length; i++) {
    // make incorrect answer list have all answers
    triviaList[i].incorrect_answers.unshift(triviaList[i].correct_answer);

    //populate the initial object
    let objQAndA = {
      question: triviaList[i].question,
      suggestedAnswers: triviaList[i].incorrect_answers,
      correctAnswer: triviaList[i].correct_answer,
      userChoice: "",
    };

    shuffleArray(objQAndA.suggestedAnswers);
    questionList.push(objQAndA);
  }

  // get new list of trivia (so we don't have to deal with async)
  getTriviaFromAPI();
  //  console.log(questionList);
}

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
      questionScreen.collapse("show");
      finalScoreScreen.collapse("hide");
      highScoreScreen.collapse("hide");
      header.collapse("show");
      break;
  }
}

function startGame() {
  secondsLeft = 60;
  curQuestionNum = 0;
  userScore = 0;

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

function gameOver() {
  //display game over screen
  //display high score input

  console.log("gameOver");
  showScreen("finalScoreScreen");
  getInitials();
}

function getInitials() {
  clearInterval(timerInterval);
  let formContainer = $("<div>").addClass("gameOverForm");
  $("#finalScoreScreen").append(formContainer);
  $(formContainer).append("<h1>GAME OVER!</h1>");
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
  $("#initial-form").append("<input type='text' name='initial-input' class='ms-1'>");
  $("#initial-form").append("<button id='btnSubmit'>Submit Score</button>");
  $("#initial-form").on("submit", function (event) {
    storeHighScore(event);
  });
}

function storeHighScore(event) {
  event.preventDefault();
  let scoreList = getHighScores(gameName);
  let scoreObject = {
    name: $("#initial-form input").val(),
    score: userScore,
    time: secondsLeft,
  };
  console.log(scoreObject);
  scoreList.unshift(scoreObject);

  localStorage.setItem(gameName, JSON.stringify(scoreList));
  showHighScores();
}

function showHighScores() {
  $("#highScoreScreen").append("<h1 class='highScore-header>High Scores</h1>");

  // create the tabs
  let tabList = $("<ul>").addClass("nav nav-tabs nav-justified");
  // add tab names
  let jokeTab = $("<li>");
  let triviaTab = $("<li>");
  // add links to the tab that will display when clicked (these are to divs)
  let jokeTabLink = $("<a>")
    .attr("data-toggle", "tab")
    .attr("href", "#jokeTable")
    .text("Joke Trivia");

  let triviaTabLink = $("<a>")
    .attr("data-toggle", "tab")
    .attr("href", "#triviaTable")
    .text("Trivia Trivia");

  // add links to the tabs and tabs to the list
  jokeTab.append(jokeTabLink);
  triviaTab.append(triviaTabLink);

  tabList.append(jokeTab);
  tabList.append(triviaTab);

  // add content divs
  let tabContent = $("<div>").attr(("class", "tab-content"));

  let jokeDiv = $("<div>")
    .attr("class", "tab-pane fade")
    .attr("id", "jokeTable");

  let triviaDiv = $("<div>")
    .attr("class", "tab-pane fade")
    .attr("id", "triviaTable");

  // add content to the divs and divs to the container
  jokeDiv.append(getTable(getHighScores(jokeTrivia)));
  triviaDiv.append(getTable(getHighScores(triviaTrivia)));

  tabContent.append(jokeDiv);
  tabContent.append(triviaDiv);

  // select active tab and div based off of last game played
  if (gameName === "trivia trivia") {
    triviaTab.addClass("active");
    jokeTab.removeClass("active");
    triviaDiv.addClass("active");
    jokeDiv.removeClass("active");
  } else {
    triviaTab.removeClass("active");
    jokeTab.addClass("active");
    triviaDiv.removeClass("active");
    jokeDiv.addClass("active");
  }

  // add everything to the page
  $("#highScoreScreen").append(tabList);
  $("#highScoreScreen").append(tabContent);
}

// takes in an array and returns a jQuery table object
function getTable(arrData) {
  let table = $("<table>");

  // -1 is the table header
  for (let i = -1; i < data.length; i++) {
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

$(document).ready(function () {
  getJokeFromAPI();
  getTriviaFromAPI();
  showScreen("mainScreen");
});

$("#btnJoke").on("click", function () {
  gameName = "joke trivia";
  createJokeArray();
  startGame();
});

$("#btnTrivia").on("click", function () {
  gameName = "trivia trivia";
  createTriviaArray();
  startGame();
});
