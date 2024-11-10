/////////// LE DOM !!!!
const roue = document.querySelector(".roue");
const segments = document.querySelectorAll(".segment");
const question = document.getElementById("question");
const show = document.getElementById("show");
const choix = document.getElementById("choix");
const submitInput = document.getElementById("submit-answer");
const userInput = document.getElementById("answer");

/////////// LA ROUE !!!!
let currentRotation = 0;
let selectedCategory = "";
let questionsData = {}; // stocker questions préchargées
let questionsLoaded = false; // Indicateur pour savoir si les questions sont chargées
show.style.visibility = "hidden";

/////////// PRÉCHARGEMENT DES QUESTIONS !!!!
async function prefetchQuestions() {
  // Charger les questions dès le chargement de la page
  try {
    const response = await fetch("questions.json");
    if (!response.ok) {
      throw new Error(
        "Erreur dans le fetch des questions sur le try ! : " + response.status
      );
    }
    questionsData = await response.json();
    questionsLoaded = true; // passage à true pour MAJ indicateur
    console.log("Questions préchargées :", questionsData);
  } catch (error) {
    console.error(
      "Erreur lors du préchargement des questions sans le catch :",
      error
    );
  }
}
prefetchQuestions();

function spinWheel() {
  // Vérifier si les questions sont chargées avant de tourner la roue
  if (!questionsLoaded) {
    console.log("questions en attente de chargement...");
    return;
  }
  // Tourner 6 fois et ajouter le randomAngle
  //ajouter quelque chose pour aller de moins en moins vite ?
  const randomAngle = Math.floor(Math.random() * 360);
  currentRotation += 360 * 6 + randomAngle;

  roue.style.transition = "transform 2s ease-out";
  roue.style.transform = `rotate(${currentRotation}deg)`;
  // Après la rotation, trouver le segment sélectionné
  roue.addEventListener("transitionend", () => {
    const selectedSegment = Math.floor((360 - (currentRotation % 360)) / 60);
    selectedCategory = segments[selectedSegment].textContent.trim();
    console.log(`Le thème sélectionné est : ${selectedCategory}`);

    giveAQuestion(selectedCategory);
  });
}

// chargement pas complet => on ne peut pas tourner la roue
roue.addEventListener("click", spinWheel);

let currentPropositions = [];
let currentAnswer = "";
let propositionChoisie = "";

function showPropositions() {
  console.log("Propositions:", currentPropositions);
  choix.innerHTML = "";
  show.style.display = "none";
  currentPropositions.forEach((proposition) => {
    const choiceElement = document.createElement("button");
    choiceElement.textContent = proposition;
    choiceElement.addEventListener("click", () => {
      selectedProposition = proposition;
      submitButton(selectedProposition, choiceElement);
      console.log(selectedProposition);
    });
    choix.appendChild(choiceElement);
  });
}

function giveAQuestion(selectedCategory) {
  if (questionsData && questionsData.quizz[selectedCategory]) {
    const difficultyLevel = "débutant";
    const questions = questionsData.quizz[selectedCategory][difficultyLevel];
    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    currentPropositions = randomQuestion.propositions;
    currentAnswer = randomQuestion.reponse;

    if (question) {
      question.innerHTML = `${selectedCategory} : ${randomQuestion.question}`;
    }
    if (show) {
      show.addEventListener("click", showPropositions);
    }
    if (userInput) {
      userInput.value = "";
      userInput.style.backgroundColor = "";
    }
    if (currentPropositions) {
      show.style.visibility = "visible";
      show.style.display = "flex";
      choix.innerHTML = "";
    }
  } else {
    console.log("Aucune question trouvée pour la catégorie sélectionnée");
  }
}

// à voir pour les accents : methode normalize é è à puis replace e,e a
// ou carrément la distance de Levenshtein !

function DistanceDeLevenshtein(a, b) {
  const matrix = [];

  // Initialiser la première ligne et la première colonne de la matrice
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Remplir la matrice en comparant chaque caractère des chaînes
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Substitution
          matrix[i][j - 1] + 1, // Insertion
          matrix[i - 1][j] + 1 // Suppression
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function submitAnswer() {
  const userAnswer = userInput.value.trim().toLowerCase();
  const currentAnswerLowerCase = currentAnswer.toLowerCase();
  const levenshteinTolerance = 2; // Tolérance de 2 changements
  const levenshteinDistance = DistanceDeLevenshtein(
    userAnswer,
    currentAnswerLowerCase
  );

  console.log(userAnswer);

  if (userAnswer === "") {
    console.log("vide");

    userInput.style.backgroundColor = "#E23B3B";
    userInput.style.boxShadow = "none";
    question.classList.add("noSelectedQuestion");
    return;
  } else if (levenshteinDistance <= levenshteinTolerance) {
    console.log("ok");
    userInput.style.backgroundColor = "#59F9A3";
    userInput.classList.add("correct-answer");
    userInput.style.boxShadow = "0px 2px 15px 0px lightblue";
  } else {
    console.log("ko");
    userInput.style.backgroundColor = "#E23B3B";
    userInput.style.boxShadow = "none";
  }
}
//CLCK
submitInput.addEventListener("click", submitAnswer);
//ENTER
document.addEventListener("keydown", (e) => {
  e.stopPropagation();
  if (e.key === "Enter") {
    submitAnswer();
  }
});

function submitButton(propositionChoisie, buttonElement) {
  if (propositionChoisie === currentAnswer) {
    buttonElement.style.backgroundColor = "#59F9A3";
    buttonElement.style.boxShadow = "0px 2px 15px 0px lightblue";
    buttonElement.classList.add("correct-answer");
  } else {
    buttonElement.style.backgroundColor = "#E23B3B";
    buttonElement.style.boxShadow = "none";
  }
}
