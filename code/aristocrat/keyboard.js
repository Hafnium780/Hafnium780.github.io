document.addEventListener("keydown", (e) => {
  if (currentTextDiv !== undefined) {
    e.preventDefault();
    if (e.key.length === 1 && isLetter(e.key)) {
      const p = e.key.toLowerCase();
      textDivs[currentTextDiv].plaintext.value = e.key.toLowerCase();
      if (syncMappingGuesses) {
        mappingGuess[
          letterIndex(textDivs[currentTextDiv].ciphertext.innerText)
        ] = p;
        updateCiphertextMappings(
          letterIndex(textDivs[currentTextDiv].ciphertext.innerText),
          p
        );
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
          if (textDivs[currentTextDiv].plaintext.value !== "") {
            textDivs[currentTextDiv].plaintext.value = "";
          } else {
            previousCell();
            textDivs[currentTextDiv].plaintext.value = "";
          }
          mappingGuess[
            letterIndex(textDivs[currentTextDiv].ciphertext.innerText)
          ] = "";
          updateCiphertextMappings(
            letterIndex(textDivs[currentTextDiv].ciphertext.innerText),
            ""
          );
          boardChanged();
          break;
      }
    }
  }
});
