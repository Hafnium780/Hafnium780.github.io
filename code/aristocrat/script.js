let plaintext =
  "Hafnium is a chemical element with the symbol Hf and atomic number 72. A lustrous, silvery gray, tetravalent transition metal, hafnium chemically resembles zirconium and is found in many zirconium minerals.";
let ciphertext = "";
plaintext = plaintext.toUpperCase();

const isLetter = (c) => {
  return c >= "A" && c <= "Z";
};

const letterIndex = (c) => {
  return c.charCodeAt(0) - 65;
};

const mapping = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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

const reverseMapping = Array(26);

mapping.forEach((v, i) => {
  reverseMapping[letterIndex(v)] = String.fromCharCode(i + 65);
});

for (const c of plaintext) {
  ciphertext += isLetter(c) ? mapping[letterIndex(c)] : c;
}

const textDiv = document.getElementsByClassName("text")[0];
const plaintextDivs = [];
let currentPlaintextDiv = undefined;

const createLetter = (c, wordDiv) => {
  const letterDiv = document.createElement("div");
  const ciphertextDiv = document.createElement("div");
  const plaintextDiv = document.createElement("input");
  letterDiv.classList.add("letter");
  ciphertextDiv.classList.add("ciphertext");
  plaintextDiv.classList.add("plaintext");
  wordDiv.appendChild(letterDiv);
  letterDiv.appendChild(ciphertextDiv);
  letterDiv.appendChild(plaintextDiv);
  ciphertextDiv.innerText = c;
  let i = plaintextDivs.length;
  plaintextDiv.addEventListener("focus", () => {
    currentPlaintextDiv = i;
  });
  plaintextDiv.addEventListener("focusout", () => {
    if (currentPlaintextDiv === i) currentPlaintextDiv = undefined;
  });

  plaintextDivs.push(plaintextDiv);
  // plaintextDiv.innerText = c;
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

const createWord = (word) => {
  const wordDiv = document.createElement("div");
  wordDiv.classList.add("word");
  textDiv.appendChild(wordDiv);
  for (const c of word) {
    if (isLetter(c)) {
      createLetter(c, wordDiv);
    } else {
      createSymbol(c, wordDiv);
    }
  }
};

for (const w of ciphertext.split(" ")) {
  createWord(w);
}
