const config = {};

const configDiv = document.getElementById("config");
const configCallbacks = [];

const createConfigOption = (
  id,
  defaultValue,
  name,
  description,
  changedCallback = () => {}
) => {
  config[id] = JSON.parse(localStorage.getItem(id)) ?? defaultValue;
  const configOuterDiv = document.createElement("div");
  const configNameDiv = document.createElement("div");
  const configToggle = document.createElement("input");
  configOuterDiv.classList.add("config-outer");
  configNameDiv.classList.add("config-name");
  configToggle.classList.add("config-toggle");
  configNameDiv.innerText = name;
  configToggle.type = "checkbox";
  configToggle.checked = config[id];
  configOuterDiv.append(configToggle);
  configOuterDiv.append(configNameDiv);
  configDiv.append(configOuterDiv);

  configToggle.addEventListener("change", () => {
    localStorage.setItem(id, configToggle.checked);
    config[id] = configToggle.checked;
    changedCallback();
  });
  configCallbacks.push(changedCallback);
};

const callConfigCallbacks = () => {
  for (const configCallback of configCallbacks) configCallback();
};

// // config - done
// let syncMappingGuesses = true; // Sync the mapping between ciphertext and plaintext across all ciphertext occurences, including mapping table if shown.
// let mappingTable = true; // Show the mapping table below the text.
// let textLetterFrequencies = true; // Show the letter freequencies on each letter in the text.
// let tableLetterFrequencies = true; // Show the letter frequencies on the mapping table.
// let hideSymbols = false; // Hide all non-letter characters (patristocrat cipher).
// let highlightAllOccurrences = true; // Highlight all occurences of the current ciphertext letter selected.

// // config - todo
// let preventImpossibleSolutions = true; // Prevents impossible solutions from being entered (e.g. multiple letters mapping to the same letter, letter mapping to same letter)

// variables
// aristocrat
let plaintext = "";
let rawPlaintext = "";
let ciphertext = "";

let mapping = [],
  reverseMapping = [],
  mappingGuess = [];

let letterFrequencies;

// interaction
let currentTextDiv;
let currentMappingDiv;
let currentCiphertextIndexSelected;
let timeSeconds;
let timerInterval;

let completed;

// stats
let totalTime = JSON.parse(localStorage.getItem("total-time-spent")) ?? 0;
let ciphersCompleted =
  JSON.parse(localStorage.getItem("total-ciphers-completed")) ?? 0;

// html
const textDiv = document.getElementById("text");
const mappingDiv = document.getElementById("mapping");
const timerDiv = document.getElementById("timer");
const averageTimeDiv = document.getElementById("average-time");
const ciphersCompletedDiv = document.getElementById("ciphers-completed");

let letterDivs = [];
let mappingDivs = [];
let letterDivsByCiphertext = Array(26)
  .fill()
  .map(() => []);

// helper funcs
const boardChanged = () => {
  if (config["syncMappingGuesses"]) updateMappingGuess();
  checkSolution();
  if (config["highlightImpossible"]) checkForImpossible();
};

const isLetter = (c) => {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
};

const letterIndex = (c) => {
  if (c >= "A" && c <= "Z") return c.charCodeAt(0) - 65;
  return c.charCodeAt(0) - 97;
};

const previousCell = () => {
  if (currentTextDiv !== undefined) {
    currentTextDiv =
      (currentTextDiv + letterDivs.length - 1) % letterDivs.length;
    letterDivs[currentTextDiv].plaintext.focus();
  } else if (currentMappingDiv !== undefined) {
    currentMappingDiv =
      (currentMappingDiv + mappingDivs.length - 1) % mappingDivs.length;
    mappingDivs[currentMappingDiv].plaintext.focus();
  }
};

const nextCell = () => {
  if (currentTextDiv !== undefined) {
    currentTextDiv = (currentTextDiv + 1) % letterDivs.length;
    letterDivs[currentTextDiv].plaintext.focus();
  } else if (currentMappingDiv !== undefined) {
    currentMappingDiv = (currentMappingDiv + 1) % mappingDivs.length;
    mappingDivs[currentMappingDiv].plaintext.focus();
  }
};

const nextEmptyCell = () => {
  const initialCell = currentTextDiv;
  do {
    currentTextDiv = (currentTextDiv + 1) % letterDivs.length;
  } while (
    letterDivs[currentTextDiv].plaintext.value !== "" &&
    initialCell != currentTextDiv
  );
  if (initialCell === currentTextDiv)
    currentTextDiv = (currentTextDiv + 1) % letterDivs.length;
  letterDivs[currentTextDiv].plaintext.focus();
};

const updateCiphertextMappings = (c, p) => {
  for (const textDiv of letterDivsByCiphertext[c]) {
    textDiv.plaintext.value = p;
  }
};

const clearText = () => {
  textDiv.innerHTML = "";
  letterDivs = [];
  letterDivsByCiphertext = Array(26)
    .fill()
    .map(() => []);
};

const createLetter = (c, wordDiv, inText) => {
  const letterDiv = document.createElement("div");
  const ciphertextDiv = document.createElement("div");
  const plaintextDiv = document.createElement("input");
  letterDiv.classList.add("letter");
  ciphertextDiv.classList.add("ciphertext");
  plaintextDiv.classList.add("plaintext");
  wordDiv.append(letterDiv);
  letterDiv.append(ciphertextDiv);
  letterDiv.append(plaintextDiv);
  ciphertextDiv.innerText = c;
  if (inText) {
    let i = letterDivs.length;
    plaintextDiv.addEventListener("focus", () => {
      currentTextDiv = i;
      currentMappingDiv = undefined;
      selectCiphertext(c);
    });
    plaintextDiv.addEventListener("focusout", () => {
      if (currentTextDiv === i) currentTextDiv = undefined;
    });
    letterDivs.push({
      letter: letterDiv,
      plaintext: plaintextDiv,
      ciphertext: ciphertextDiv,
    });
    letterDivsByCiphertext[letterIndex(c)].push({
      plaintext: plaintextDiv,
      ciphertext: ciphertextDiv,
    });
  } else {
    let i = mappingDivs.length;
    plaintextDiv.addEventListener("focus", () => {
      currentMappingDiv = i;
      currentTextDiv = undefined;
      selectCiphertext(c);
    });
    plaintextDiv.addEventListener("focusout", () => {
      if (currentMappingDiv === i) currentMappingDiv = undefined;
    });

    mappingDivs.push({
      letter: letterDiv,
      plaintext: plaintextDiv,
      ciphertext: ciphertextDiv,
    });
  }
  return {
    letter: letterDiv,
    plaintext: plaintextDiv,
    ciphertext: ciphertextDiv,
  };
};

const createSymbol = (c, wordDiv) => {
  const symbolDiv = document.createElement("div");
  const symbolUpperDiv = document.createElement("div");
  const symbolLowerDiv = document.createElement("div");
  symbolDiv.classList.add("symbol");
  symbolUpperDiv.classList.add("symbol-upper");
  symbolLowerDiv.classList.add("symbol-lower");
  wordDiv.append(symbolDiv);
  symbolDiv.append(symbolUpperDiv);
  symbolDiv.append(symbolLowerDiv);
  symbolUpperDiv.innerText = c;
  symbolLowerDiv.innerText = c;
};

const createWord = (word, inText) => {
  const wordDiv = document.createElement("div");
  wordDiv.classList.add("word");
  if (inText) textDiv.append(wordDiv);
  const divs = [];
  for (const c of word) {
    if (isLetter(c)) {
      divs.push(createLetter(c, wordDiv, inText));
    } else {
      createSymbol(c, wordDiv);
    }
  }
  return { wordDiv: wordDiv, divs: divs };
};

const newMapping = () => {
  mapping = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  for (let i = 0; i < 25; i++) {
    let j;
    do {
      j = Math.floor(Math.random() * (26 - i)) + i;
    } while (letterIndex(mapping[j]) == i);

    [mapping[i], mapping[j]] = [mapping[j], mapping[i]];
  }

  if (mapping[25] == "Z") {
    let j = Math.floor(Math.random() * 25);
    [mapping[25], mapping[j]] = [mapping[j], mapping[25]];
  }

  reverseMapping = Array(26);
  mappingGuess = Array(26).fill("");

  mapping.forEach((v, i) => {
    reverseMapping[letterIndex(v)] = String.fromCharCode(i + 65);
  });
};

let quoteList;

const newText = async () => {
  completed = false;

  plaintext =
    quoteList[Math.floor(Math.random() * quoteList.length)].text.toUpperCase();

  rawPlaintext = "";
  for (const c of plaintext) {
    if (isLetter(c)) rawPlaintext += c;
  }
  if (config["hideSymbols"]) {
    plaintext = rawPlaintext;
  }
  clearText();
  newMapping();
  letterFrequencies = Array(26).fill(0);
  ciphertext = "";
  for (const c of plaintext) {
    if (isLetter(c)) {
      ciphertext += mapping[letterIndex(c)];
      letterFrequencies[letterIndex(mapping[letterIndex(c)])]++;
    } else {
      ciphertext += c;
    }
  }

  lettersLeft = Array(26).fill(0);

  for (const w of ciphertext.split(" ")) {
    createWord(w, true);
  }

  try {
    updateMappingGuess();
  } catch (e) {}

  callConfigCallbacks();
  startTimer();
};

// Mapping UI
const showMappingTable = () => {
  mappingDiv.style.display = "block";
};

const hideMappingTable = () => {
  mappingDiv.style.display = "none";
};
const createMappingDivs = () => {
  let wordDiv;
  ({ wordDiv: wordDiv, divs: _ } = createWord(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    false
  ));
  mappingDiv.append(wordDiv);
};

const updateMappingGuess = () => {
  for (let i = 0; i < 26; i++) {
    mappingDivs[i].plaintext.value = mappingGuess[i];
  }
};

let textLetterFrequencyDivs = [];
let tableLetterFrequencyDivs = [];

const updateLetterFrequencies = () => {
  for (const i in textLetterFrequencyDivs)
    textLetterFrequencyDivs[i].innerText =
      letterFrequencies[letterIndex(letterDivs[i].ciphertext.innerText)];

  for (const i in tableLetterFrequencyDivs)
    tableLetterFrequencyDivs[i].innerText = letterFrequencies[i];
};

const showTextLetterFrequencies = () => {
  hideTextLetterFrequencies();
  for (const letterDiv of letterDivs) {
    const letterFrequencyDiv = document.createElement("div");
    letterFrequencyDiv.classList.add("text-frequency");
    letterDiv.letter.prepend(letterFrequencyDiv);
    textLetterFrequencyDivs.push(letterFrequencyDiv);
  }
  updateLetterFrequencies();
};

const hideTextLetterFrequencies = () => {
  for (const div of textLetterFrequencyDivs) {
    div.remove();
  }
  textLetterFrequencyDivs = [];
};

const showTableLetterFrequencies = () => {
  hideTableLetterFrequencies();
  for (const letterDiv of mappingDivs) {
    const letterFrequencyDiv = document.createElement("div");
    letterFrequencyDiv.classList.add("text-frequency");
    letterFrequencyDiv.innerText =
      letterFrequencies[letterIndex(letterDiv.ciphertext.innerText)];
    letterDiv.letter.prepend(letterFrequencyDiv);
    tableLetterFrequencyDivs.push(letterFrequencyDiv);
  }
  updateLetterFrequencies();
};

const hideTableLetterFrequencies = () => {
  for (const div of tableLetterFrequencyDivs) {
    div.remove();
  }
  tableLetterFrequencyDivs = [];
};

const selectCiphertext = (c) => {
  const ciphertextIndex = letterIndex(c);
  if (ciphertextIndex === currentCiphertextIndexSelected) return;
  if (currentCiphertextIndexSelected !== undefined) {
    for (const letterDiv of letterDivsByCiphertext[
      currentCiphertextIndexSelected
    ]) {
      letterDiv.plaintext.classList.remove("selected");
    }
  }

  if (!config["highlightAllOccurrences"]) return;
  for (const letterDiv of letterDivsByCiphertext[ciphertextIndex]) {
    letterDiv.plaintext.classList.add("selected");
  }
  currentCiphertextIndexSelected = ciphertextIndex;
};

const checkSolution = () => {
  let solution = "";
  for (const letterDiv of letterDivs) {
    solution += letterDiv.plaintext.value;
  }
  if (solution.toUpperCase() == rawPlaintext) completedCipher();
};

const revealAnswer = () => {
  if (completed) return;
  completed = true;
  stopTimer(false);
  clearHighlighting();
  for (const i in letterDivs) {
    letterDivs[i].plaintext.value = rawPlaintext[i].toLowerCase();
  }
};

const completedCipher = () => {
  if (completed) return;
  completed = true;
  stopTimer(true);
  clearHighlighting();
  if (config["autoReset"]) setTimeout(newText, 500);
};

const secondsToTime = (s) => {
  const minutes = Math.floor(s / 60).toString();
  const seconds = (s % 60).toString();
  return minutes.padStart(2, "0") + ":" + seconds.padStart(2, "0");
};

const startTimer = () => {
  stopTimer();
  timerDiv.innerText = "00:00";
  timeSeconds = 0;
  timerInterval = setInterval(() => {
    timeSeconds++;
    timerDiv.innerText = secondsToTime(timeSeconds);
  }, 1000);
};

const stopTimer = (addToStats = false) => {
  if (timerInterval !== undefined) clearInterval(timerInterval);
  if (addToStats) {
    totalTime += timeSeconds;
    ciphersCompleted++;
    updateStatistics();
    localStorage.setItem("total-time-spent", totalTime);
    localStorage.setItem("total-ciphers-completed", ciphersCompleted);
  }
  // timerDiv.innerText = "--:--";
  // timeSeconds = 0;
};

const updateStatistics = () => {
  ciphersCompletedDiv.innerText = ciphersCompleted;
  averageTimeDiv.innerText = secondsToTime(
    Math.round(totalTime / ciphersCompleted) || 0
  );
};

const resetStatistics = () => {
  totalTime = 0;
  ciphersCompleted = 0;
  localStorage.removeItem("total-time-spent");
  localStorage.removeItem("total-ciphers-completed");
  updateStatistics();
};

const clearMappingGuess = () => {
  clearHighlighting();
  for (const i in mappingGuess) {
    mappingGuess[i] = "";
  }
  updateMappingGuess();
  for (const letterDiv of letterDivs) {
    letterDiv.plaintext.value = "";
  }
};

const clearHighlighting = () => {
  for (const letterDiv of letterDivs) {
    letterDiv.plaintext.classList.remove("impossible");
    letterDiv.plaintext.classList.remove("selected");
  }
};

const checkForImpossible = () => {
  const usedLetter = new Array(26).fill(-1);
  let invalidLetters = new Set();
  for (let i = 0; i < 26; i++) {
    if (isLetter(mappingGuess[i])) {
      if (letterIndex(mappingGuess[i]) == i) {
        invalidLetters.add(String.fromCharCode(i + 65));
      }
      if (
        usedLetter[letterIndex(mappingGuess[i])] >= 0 &&
        usedLetter[letterIndex(mappingGuess[i])] !== i
      ) {
        invalidLetters.add(String.fromCharCode(i + 65));
        invalidLetters.add(
          String.fromCharCode(usedLetter[letterIndex(mappingGuess[i])] + 65)
        );
      }
      usedLetter[letterIndex(mappingGuess[i])] = i;
    }
  }
  invalidLetters = [...invalidLetters];
  for (const letterDiv of letterDivs) {
    letterDiv.plaintext.classList.remove("impossible");
  }
  for (const invalid of invalidLetters) {
    for (const letterDiv of letterDivsByCiphertext[letterIndex(invalid)]) {
      letterDiv.plaintext.classList.add("impossible");
    }
  }
};

(async () => {
  createConfigOption("autoReset", false, "Auto Reset on Completion", "a");
  createConfigOption("syncMappingGuesses", true, "Sync Mapping Guesses", "a");
  createConfigOption("mappingTable", true, "Mapping Table", "a", () => {
    if (config["mappingTable"]) showMappingTable();
    else hideMappingTable();
  });
  createConfigOption(
    "textLetterFrequencies",
    true,
    "Letter Frequencies Over Text",
    "a",
    () => {
      if (config["textLetterFrequencies"]) showTextLetterFrequencies();
      else hideTextLetterFrequencies();
    }
  );
  createConfigOption(
    "tableLetterFrequencies",
    true,
    "Letter Frequencies Over Table",
    "a",
    () => {
      if (config["tableLetterFrequencies"]) showTableLetterFrequencies();
      else hideTableLetterFrequencies();
    }
  );
  createConfigOption(
    "highlightAllOccurrences",
    true,
    "Highlight All Occurrences",
    "a"
  );
  createConfigOption(
    "highlightImpossible",
    true,
    "Highlight Impossible Guesses",
    "a"
  );
  createConfigOption("hideSymbols", false, "Hide Symbols (Patristocrat)", "a");

  createMappingDivs();

  updateStatistics();
  quoteList = (await (await fetch("quotes.json")).json()).quotes;
  await newText();
})();
