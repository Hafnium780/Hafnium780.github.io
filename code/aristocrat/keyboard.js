document.addEventListener("keydown", (e) => {
  if (currentTextDiv !== undefined && currentMappingDiv !== undefined)
    console.warn("Text and mapping div both selected");
  if (currentTextDiv !== undefined) {
    e.preventDefault();
    const ciphertextIndex = letterIndex(
      letterDivs[currentTextDiv].ciphertext.innerText
    );
    if (e.key.length === 1 && isLetter(e.key)) {
      const p = e.key.toLowerCase();
      letterDivs[currentTextDiv].plaintext.value = e.key.toLowerCase();
      if (config["syncMappingGuesses"]) {
        mappingGuess[ciphertextIndex] = p;
        updateCiphertextMappings(ciphertextIndex, p);
      }
      nextEmptyCell();
      boardChanged();
    } else {
      switch (e.key) {
        case "ArrowLeft":
          previousCell();
          break;
        case "ArrowRight":
          nextCell();
          break;
        case "Backspace":
          if (letterDivs[currentTextDiv].plaintext.value !== "") {
            letterDivs[currentTextDiv].plaintext.value = "";
          } else {
            previousCell();
            letterDivs[currentTextDiv].plaintext.value = "";
          }
          const newCiphertextIndex = letterIndex(
            letterDivs[currentTextDiv].ciphertext.innerText
          );

          if (config["syncMappingGuesses"]) {
            mappingGuess[newCiphertextIndex] = "";
            updateCiphertextMappings(newCiphertextIndex, "");
          }
          boardChanged();
          break;
      }
    }
  } else if (currentMappingDiv !== undefined) {
    e.preventDefault();
    const ciphertextIndex = letterIndex(
      mappingDivs[currentMappingDiv].ciphertext.innerText
    );
    if (e.key.length === 1 && isLetter(e.key)) {
      const p = e.key.toLowerCase();
      mappingDivs[currentMappingDiv].plaintext.value = e.key.toLowerCase();
      if (config["syncMappingGuesses"]) {
        mappingGuess[ciphertextIndex] = p;
        updateCiphertextMappings(ciphertextIndex, p);
      }
      nextCell();
      boardChanged();
    } else {
      switch (e.key) {
        case "ArrowLeft":
          previousCell();
          break;
        case "ArrowRight":
          nextCell();
          break;
        case "Backspace":
          if (mappingDivs[currentMappingDiv].plaintext.value !== "") {
            mappingDivs[currentMappingDiv].plaintext.value = "";
          } else {
            previousCell();
            mappingDivs[currentMappingDiv].plaintext.value = "";
          }
          const newCiphertextIndex = letterIndex(
            mappingDivs[currentMappingDiv].ciphertext.innerText
          );

          if (config["syncMappingGuesses"]) {
            mappingGuess[newCiphertextIndex] = "";
            updateCiphertextMappings(newCiphertextIndex, "");
          }
          boardChanged();
          break;
      }
    }
  }
});
