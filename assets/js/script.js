let jokeList = [];
let triviaList = [];
let questionList = [];
let curQuestionNum = 0;
let userScore = 0;

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
      if (userAnswer === questionList.correctAnswer) {
        userScore++;
      }
      curQuestionNum++;
      generateQuestion();
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

function showScreen(screenName) {
  let mainScreen = $("#mainScreen");
  let questionScreen = $("#questionScreen ");
  let finalScoreScreen = $("#finalScoreScreen ");
  let highScoreScreen = $("#highScoreScreen ");
  let header = $("#header");

  switch (screenName) {
    case "mainScreen":
      mainScreen.attr("style", "display: flex");
      questionScreen.attr("style", "display: none");
      finalScoreScreen.attr("style", "display: none");
      highScoreScreen.attr("style", "display: none");
      header.attr("style", "display: none");
      break;
    case "questionScreen":
      mainScreen.attr("style", "display: none");
      questionScreen.attr("style", "display: block");
      finalScoreScreen.attr("style", "display: none");
      highScoreScreen.attr("style", "display: none");
      header.attr("style", "display: flex");
      break;

    default:
      break;
  }
}
function startGame() {
  // timerInterval = 0;
  // curQuestionNum = 0;

  // startTimer();

  showScreen("questionScreen");
  generateQuestion();
}

let timeRemaining = $("#timerDisplay");
let secondsLeft = 60;

function startTimer() {
  // Sets interval in variable
  let timerInterval = setInterval(function () {
    secondsLeft--;
    timeRemaining.textContent = secondsLeft;

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
