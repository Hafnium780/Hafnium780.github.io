(async () => {
  let autoCheck = true;

  let plaintext = "";
  let ciphertext = "";
  plaintext = plaintext.toUpperCase();

  // helper funcs
  const isLetter = (c) => {
    return c >= "A" && c <= "Z";
  };

  const letterIndex = (c) => {
    return c.charCodeAt(0) - 65;
  };

  const textDiv = document.getElementsByClassName("text")[0];
  const targetLetterDiv = document.getElementById("target-letter");
  const targetCountDiv = document.getElementById("target-count");

  const clearText = () => {
    textDiv.innerHTML = "";
  };

  const createLetter = (c, wordDiv) => {
    const letterDiv = document.createElement("div");
    const ciphertextDiv = document.createElement("div");
    const plaintextDiv = document.createElement("div");
    letterDiv.classList.add("letter");
    ciphertextDiv.classList.add("ciphertext");
    plaintextDiv.classList.add("plaintext");
    wordDiv.appendChild(letterDiv);
    letterDiv.appendChild(ciphertextDiv);
    letterDiv.appendChild(plaintextDiv);
    ciphertextDiv.innerText = c;
    // plaintextDiv.innerText = reverseMapping[letterIndex(c)].toLowerCase();
    let selected = false;
    letterDiv.addEventListener("click", () => {
      selected = !selected;
      if (selected) {
        lettersLeft[letterIndex(c)]--;
        letterDiv.classList.add("selected");
      } else {
        lettersLeft[letterIndex(c)]++;
        letterDiv.classList.remove("selected");
      }
      if (autoCheck) checkSelected();
    });
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

  let mapping = [],
    reverseMapping = [];

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

    mapping.forEach((v, i) => {
      reverseMapping[letterIndex(v)] = String.fromCharCode(i + 65);
    });
  };

  let lettersLeft = [];
  const newText = async () => {
    plaintext = (
      await (
        await fetch("https://quote-garden.onrender.com/api/v3/quotes/random")
      ).json()
    ).data[0].quoteText.toUpperCase();
    clearText();
    newMapping();
    ciphertext = "";
    for (const c of plaintext) {
      ciphertext += isLetter(c) ? mapping[letterIndex(c)] : c;
    }

    lettersLeft = Array(26).fill(0);

    for (const w of ciphertext.split(" ")) {
      createWord(w);
    }

    const potentialLetters = [];
    for (const c of ciphertext) {
      if (isLetter(c)) {
        potentialLetters.push(c);
        lettersLeft[letterIndex(c)]++;
      }
    }

    const findLetter =
      potentialLetters[Math.floor(Math.random() * potentialLetters.length)];
    targetLetterDiv.innerText = findLetter;
    targetCountDiv.innerText = lettersLeft[letterIndex(findLetter)];
    for (let i = 0; i < 26; i++) {
      if (i !== letterIndex(findLetter)) lettersLeft[i] = 0;
    }
  };

  const checkSelected = () => {
    let done = true;
    for (let i = 0; i < 26 && done; i++) {
      if (lettersLeft[i] !== 0) done = false;
    }
    targetCountDiv.innerText =
      lettersLeft[letterIndex(targetLetterDiv.innerText)];
    if (done) newText();
  };
  newText();
})();
