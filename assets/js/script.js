let jokeList = [];
let triviaList = [];
let questionList = [];
let curQuestionNum = 0;
let userScore;
let secondsLeft;

// get the list from local storage
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

  let currentQuestion = $("<div>").addClass("current-question");
  currentQuestion.text(questionList[curQuestionNum].question);
  $("#questionScreen").append(currentQuestion);
  let currentList = $("<ul>").addClass("answer-list");

  for (
    let i = 0;
    i < questionList[curQuestionNum].suggestedAnswers.length;
    i++
  ) {
    let currentAnswer = $("<li>").addClass("current-answer");
    currentAnswer.text(questionList[curQuestionNum].suggestedAnswers[i]);
    $(currentList).append(currentAnswer);
  }
  $("#questionScreen").append(currentList);
  $(currentList)
    .children()
    .on("click", function () {
      let userAnswer = this.textContent;
      if (userAnswer === questionList[curQuestionNum].correctAnswer) {
        userScore++;
      }
      curQuestionNum++;

      console.log(curQuestionNum, "/", questionList.length);
      if (curQuestionNum < questionList.length) {
        generateQuestion();
      } else {
        gameOver();
      }
    });
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
  let timerInterval = setInterval(function () {
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
}
$(document).ready(function () {
  getJokeFromAPI();
  getTriviaFromAPI();
  showScreen("mainScreen");
});

$("#btnJoke").on("click", function () {
  createJokeArray();
  startGame();
});

$("#btnTrivia").on("click", function () {
  createTriviaArray();
  startGame();
});
