let jokeList = [];
let triviaList = [];
let questionList = [];

// https://jservice.io/
function getTriviaFromAPI() {
  // let requestURL = "http://jservice.io/api/clues";
  let requestURL = "https://opentdb.com/api.php?amount=10&type=multiple";
  // let requestURL = "http://jservice.io/api/categories?count=100";

  fetch(requestURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // console.log(data);
      triviaList = data;
      console.log(triviaList.results);
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
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

$(document).ready(function () {
  getJokeFromAPI();
  getTriviaFromAPI();
});

$("#btnJoke").on("click", createJokeArray);
$("#btnTrivia").on("click", createTriviaArray);

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
  // console.log(questionList);
}

function createTriviaArray() {
  //place holder
}
