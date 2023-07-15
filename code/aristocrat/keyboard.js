const previousCell = () => {
  currentPlaintextDiv =
    (currentPlaintextDiv + plaintextDivs.length - 1) % plaintextDivs.length;
  plaintextDivs[currentPlaintextDiv].focus();
};

const nextCell = () => {
  currentPlaintextDiv = (currentPlaintextDiv + 1) % plaintextDivs.length;
  plaintextDivs[currentPlaintextDiv].focus();
};

document.addEventListener("keydown", (e) => {
  if (currentPlaintextDiv !== undefined) e.preventDefault();

  if (currentPlaintextDiv !== undefined) {
    if (
      e.key.length === 1 &&
      ((e.key >= "a" && e.key <= "z") || (e.key >= "A" && e.key <= "Z"))
    ) {
      plaintextDivs[currentPlaintextDiv].value = e.key.toLowerCase();
      nextCell();
    } else {
      switch (e.key) {
        case "ArrowLeft":
          previousCell();
          break;
        case "ArrowRight":
          nextCell();
          break;
        case "Backspace":
          if (plaintextDivs[currentPlaintextDiv].value !== "")
            plaintextDivs[currentPlaintextDiv].value = "";
          else {
            previousCell();
            plaintextDivs[currentPlaintextDiv].value = "";
          }
          break;
      }
    }
  }
});
