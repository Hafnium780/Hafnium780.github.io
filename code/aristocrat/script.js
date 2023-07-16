// config - done
let syncMappingGuesses = true; // Sync the mapping between ciphertext and plaintext across all ciphertext occurences, including mapping table if shown.

// config - todo
let showMappingTable = true; // Show the mapping table below the text.
let highlightAllOccurences = true; // Highlight all occurences of the current ciphertext letter selected.
let showLetterFrequenciesOnTable = true; // Show the letter frequencies on the mapping table.
let showLetterFrequenciesOnLetters = true; // Show the letter freequencies on each letter in the text.
let hideSymbols = true; // Hide all non-letter characters (patristocrat cipher).

// variables
// aristocrat
let plaintext = "";
let ciphertext = "";

let mapping = [],
  reverseMapping = [],
  mappingGuess = [];

// interaction
let currentTextDiv;

// html
const textDiv = document.getElementById("text");
const mappingDiv = document.getElementById("mapping");
let textDivs = [];
let mappingDivs = [];
let textDivsByCiphertext = Array(26)
  .fill()
  .map(() => []);

// helper funcs
const boardChanged = () => {
  updateMappingGuess();
};

const isLetter = (c) => {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
};

const letterIndex = (c) => {
  if (c >= "A" && c <= "Z") return c.charCodeAt(0) - 65;
  return c.charCodeAt(0) - 97;
};

const previousCell = () => {
  currentTextDiv = (currentTextDiv + textDivs.length - 1) % textDivs.length;
  textDivs[currentTextDiv].plaintext.focus();
};

const nextCell = () => {
  currentTextDiv = (currentTextDiv + 1) % textDivs.length;
  textDivs[currentTextDiv].plaintext.focus();
};

const nextEmptyCell = () => {
  const initialCell = currentTextDiv;
  do {
    currentTextDiv = (currentTextDiv + 1) % textDivs.length;
  } while (
    textDivs[currentTextDiv].plaintext.value !== "" &&
    initialCell != currentTextDiv
  );
  if (initialCell === currentTextDiv)
    currentTextDiv = (currentTextDiv + 1) % textDivs.length;
  textDivs[currentTextDiv].plaintext.focus();
};

const updateCiphertextMappings = (c, p) => {
  for (const textDiv of textDivsByCiphertext[c]) {
    textDiv.plaintext.value = p;
  }
};

const clearText = () => {
  textDiv.innerHTML = "";
  textDivs = [];
  textDivsByCiphertext = Array(26)
    .fill()
    .map(() => []);
};

const createLetter = (c, wordDiv, inText) => {
  const letterDiv = document.createElement("div");
  const ciphertextDiv = document.createElement("div");
  const plaintextDiv = document.createElement(inText ? "input" : "div");
  letterDiv.classList.add("letter");
  ciphertextDiv.classList.add("ciphertext");
  plaintextDiv.classList.add("plaintext");
  wordDiv.appendChild(letterDiv);
  letterDiv.appendChild(ciphertextDiv);
  letterDiv.appendChild(plaintextDiv);
  ciphertextDiv.innerText = c;
  if (inText) {
    let i = textDivs.length;
    plaintextDiv.addEventListener("focus", () => {
      currentTextDiv = i;
    });
    plaintextDiv.addEventListener("focusout", () => {
      if (currentTextDiv === i) currentTextDiv = undefined;
    });
    textDivs.push({ plaintext: plaintextDiv, ciphertext: ciphertextDiv });
    textDivsByCiphertext[letterIndex(c)].push({
      plaintext: plaintextDiv,
      ciphertext: ciphertextDiv,
    });
  }
  return { plaintext: plaintextDiv, ciphertext: ciphertextDiv };
};

const createSymbol = (c, wordDiv) => {
  const symbolDiv = document.createElement("div");
  const symbolUpperDiv = document.createElement("div");
  const symbolLowerDiv = document.createElement("div");
  symbolDiv.classList.add("symbol");
  symbolUpperDiv.classList.add("symbol-upper");
  symbolLowerDiv.classList.add("symbol-lower");
  wordDiv.appendChild(symbolDiv);
  symbolDiv.appendChild(symbolUpperDiv);
  symbolDiv.appendChild(symbolLowerDiv);
  symbolUpperDiv.innerText = c;
  symbolLowerDiv.innerText = c;
};

const createWord = (word, inText) => {
  const wordDiv = document.createElement("div");
  wordDiv.classList.add("word");
  if (inText) textDiv.appendChild(wordDiv);
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

const newText = async () => {
  plaintext = (
    await (await fetch("https://api.quotable.io/random")).json()
  ).content.toUpperCase();
  clearText();
  newMapping();
  ciphertext = "";
  for (const c of plaintext) {
    ciphertext += isLetter(c) ? mapping[letterIndex(c)] : c;
  }

  lettersLeft = Array(26).fill(0);

  for (const w of ciphertext.split(" ")) {
    createWord(w, true);
  }
};

// Mapping UI
const showMapping = () => {
  mappingDiv.style.display = "block";
};

const hideMapping = () => {
  mappingDiv.style.display = "none";
};
const createMappingDivs = () => {
  let wordDiv;
  ({ wordDiv: wordDiv, divs: mappingDivs } = createWord(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    false
  ));
  mappingDiv.appendChild(wordDiv);
};

const updateMappingGuess = () => {
  for (let i = 0; i < 26; i++) {
    mappingDivs[i].plaintext.innerText = mappingGuess[i];
  }
};

createMappingDivs();
if (syncMappingGuesses) showMapping();
else hideMapping();
newText();
