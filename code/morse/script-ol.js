(() => {
  function tabIsActive() {
    return isActive["output-letter-tab"];
  }

  const tab = document.getElementById("output-letter-tab");
  const outputLetterDisplay = document.getElementById("output-letter-display");
  const outputLetterButtonsTop = document.getElementById(
    "output-letter-buttons-top"
  );
  const outputLetterButtonsBottom = document.getElementById(
    "output-letter-buttons-bottom"
  );
  const letterToOutputButton = {};
  let targetLetter = "";

  document.addEventListener("keydown", (e) => {
    if (
      tabIsActive() &&
      !e.repeat &&
      e.key.length === 1 &&
      ((e.key >= "a" && e.key <= "z") || (e.key >= "A" && e.key <= "Z"))
    ) {
      let key = e.key.toLowerCase();
      letterToOutputButton[key].click();
    }
  });

  function newLetter() {
    let newLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    outputLetterDisplay.innerText = letterToMorse[newLetter];
    targetLetter = newLetter;
  }

  newLetter();

  for (let i = 0; i < 26; i++) {
    const letterButton = document.createElement("div");
    const letter = String.fromCharCode(i + 97);
    letterButton.innerText = letter;
    letterButton.classList.add("output-letter-button");
    if (i < 13) outputLetterButtonsTop.append(letterButton);
    else outputLetterButtonsBottom.append(letterButton);

    let animationTimeout;
    letterButton.addEventListener("click", () => {
      if (animationTimeout) {
        letterButton.classList.remove("button-selected");
        clearTimeout(animationTimeout);
      }
      letterButton.classList.add("button-selected");
      animationTimeout = setTimeout(() => {
        letterButton.classList.remove("button-selected");
      }, 50);

      if (letter === targetLetter) newLetter();
    });

    letterToOutputButton[letter] = letterButton;
  }
})();
