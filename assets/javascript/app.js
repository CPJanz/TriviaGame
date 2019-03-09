const QUESTION_TIME_LIMIT = 20000; // in ms
const POST_ANSWER_PAUSE = 4000; // in ms
const QUIZ_LENGTH = 10;
let questionsAsked = 0;
let questionArray = [];
let correctAnswers = 0;
let incorrectAnswers = 0;
let questionTimeout; //this holds the timeout for the current question
let timerInterval; //this holds the interval of the timer for the current question

class question {
    constructor(question, answers, imageURL) {
        this.question = question;
        this.answers = answers;
        this.imageURL = imageURL;
        this.correctAnswer = answers[0];
    }

    //This method creates a question card with 4 answers in a random order.
    generateCard() {
        let result = $('<div class="col-9" id="question-card"><div class="row" id="question-card-question-row"><div class="col-12 pb-5 p-4" id="question-card-question-col"><h2>' + this.question + '</h2></div></div><div class="row answer-row pt-4" id="question-card-answer-row-1"></div><div class="row answer-row pb-4" id="question-card-answer-row-2"></div></div>');
        this.generateButtons(result.children()[1], result.children()[2]);
        $("#answer-image-row").html($('<img style="display:none" src="assets/images/' + this.imageURL + '" alt="' + this.correctAnswer + '">'));

        return result;
    }

    //This method creates the answer buttons, the two answer rows are passed in  for appending.
    generateButtons(rowOne, rowTwo) {
        let randomizer = [0, 1, 2, 3];
        for (let i = 0; i < this.answers.length; i++) {
            let index = randomizer.splice(Math.floor(Math.random() * randomizer.length), 1);
            let answerText = this.answers[index];
            let button = $('<div class="col-3 offset-2 question-answer my-3"id="answer-' + index + '"><h4>' + answerText + '</h4></div');

            button.on("click", function() {
                clearTimeout(questionTimeout); //Clearing the question time limit now that an answer has been chosen.
                clearInterval(timerInterval); //Stopping the timer from updating
                if (index[0] === 0) {
                    $("#answer-0").addClass("correct");
                    $("#timer-row").html('<h2 class="correct-text">Correct</h2>');
                    correctAnswers++;

                } else {
                    $("#answer-0").addClass("correct");
                    $("#answer-" + index).addClass("incorrect");
                    $("#timer-row").html('<h2 class="incorrect-text">Incorrect</h2>');
                    incorrectAnswers++;
                }
                $(".question-answer").off("click"); //Unbinds on click event from all the answer buttons
                postQuestionState();
            })

            if (i < 2) {
                rowOne.append(button[0]);
            } else {
                rowTwo.append(button[0]);
            }
        }
    }
}


//push questions to the questionArray
function generateQuestions() {
    questionArray.push(new question("What card has the following flavor text? <br><br> <em>'A blade that has never known sheath, a hilt that has never known hand.'</em>", ["Dancing Scimitar", "Sword of the Ages", "Whirling Dervish", "Blade Sentinel"], "dancing-scimitar.jpg"));
    questionArray.push(new question("First printed in Alpha, is the only card with art painted by Faye Jones. It pictures a clown and a blindfolded humanoid fox balanced on a scale.", ["Stasis", "Jackal Pup", "Atog", "Noetic Scales"], "stasis.jpg"));
    questionArray.push(new question("Which of these is NOT a creature type on the card Coiling Oracle?", ["Merfolk", "Snake", "Elf", "Druid"], "coiling_oracle.jpg"));
    questionArray.push(new question("Which of these lands is both a Swamp and and Island", ["Underground Sea", "Overgrown Tomb", "Lonely Sandbar", "Bloodstained Mire"], "underground_sea.jpg"));
    questionArray.push(new question("What card has the following flavor text? <br><br> <em>'I want a banana this big!'</em>", ["Gorilla Titan", "Tasigur, the Golden Fang", "Uktabi Orangutan", "Hyalopterous Lemure"], "gorilla_titan.jpg"));
    questionArray.push(new question("What is the converted mana cost of the card Enlisted Wurm?", [6, 5, 7, 8], "enlisted_wurm.jpg"));
    questionArray.push(new question("Besides Shaman, what creature type does Thundercloud Shaman have?", ["Giant", "Elf", "Elemental", "Goblin"], "thundercloud_shaman.jpg"));
    questionArray.push(new question("How much damage does the card Pyroclasm do to each creature?", [2, 3, 4, 1], "pyroclasm.jpg"));
    questionArray.push(new question("What is Lord of the Pit's power and toughness?", ["7/7", "6/6", "5/5", "8/8"], "lord_of_the_pit.jpg"));
    questionArray.push(new question("What color is the card Volcanic Erruption", ["Blue", "Red", "Black", "Green"], "volcanic_erruption.jpg"));
}

function resetGame() {
    questionArray = [];
    correctAnswers = 0;
    incorrectAnswers = 0;
    questionsAsked = 0;
    $("#score-column").html($('<h4>Correct Answers: ' + correctAnswers + '   |   Incorrect Answers: ' + incorrectAnswers + '</h4>'))
    generateQuestions();
}

function setUpGame() {
    resetGame();
    $("#question-card").replaceWith($('<div class="col-9 pt-5" id="question-card"><div class="row"><h2>Click below to play!</h2></div><div class="row py-5"><div class="col-2 offset-5 custom-button" id="start-button"><h4>Start</h4></div></div></div>'));
    $("#start-button").click(function() {
        presentQuestion();
    })
}

function presentQuestion() {
    //Grabs a remaining question at random, turns it into a question card and displays it to the user
    $("#question-card").replaceWith(questionArray.splice(Math.floor(Math.random() * (questionArray.length) - 1), 1)[0].generateCard());
    questionsAsked++;
    // Sets up question time limit
    questionTimeout = setTimeout(function() {
        $("#answer-0").addClass("correct");
        $("#timer-row").html("<h2 class='incorrect-text'>Time's Up!</h2>");
        incorrectAnswers++;
        postQuestionState();
    }, QUESTION_TIME_LIMIT)

    // Sets up timer display
    let timeLeft = QUESTION_TIME_LIMIT / 1000;
    $("#timer-row").html($("<h2>" + timeLeft + "</h2>"));
    timerInterval = setInterval(function() {
        timeLeft--;
        $("#timer-row").html($("<h2>" + timeLeft + "</h2>"));
    }, 1000)
}

function postQuestionState() {
    clearInterval(timerInterval);
    //Update score display and show answer card
    $("#score-column").html($('<h4>Correct Answers: ' + correctAnswers + '   |   Incorrect Answers: ' + incorrectAnswers + '</h4>'));
    $("#answer-image-row > img").show();
    setTimeout(function() {
        if (questionsAsked < QUIZ_LENGTH) {
            presentQuestion();
        } else {
            gameEnded();
        }
    }, POST_ANSWER_PAUSE);
}

function gameEnded() {
    $("#answer-image-row > img").hide();
    $("#timer-row").html("");
    $("#question-card").replaceWith($('<div class="col-9 pt-5" id="question-card"><div class="row"><h2>Game Over!</h2></div><div class="row py-5"><div class="col-2 offset-5 custom-button" id="restart-button"><h4>Try Again?</h4></div></div></div>'));
    $("#restart-button").click(function() {
        resetGame();
        presentQuestion();
    })
    console.log("Game Ended!")
}



$(document).ready(function() {
    generateQuestions();
    setUpGame();
})