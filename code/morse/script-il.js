(() => {
  function tabIsActive() {
    return isActive["input-letter-tab"];
  }

  let last_time = 0;
  let mouseDown = false;
  let currentMorse = "";
  let animation = false;
  const tab = document.getElementById("input-letter-tab");
  const morseButton = document.getElementById("input-letter-morse");
  const actualLetter = document.getElementById("input-letter-actual");
  const targetLetter = document.getElementById("input-letter-target");

  function updateButtonText() {
    morseButton.innerText = currentMorse;
  }

  function morse_down() {
    mouseDown = true;
    last_time = Date.now();
    morseButton.style.backgroundColor = "#777777";
  }

  function morse_up() {
    len = Date.now() - last_time;
    last_time = Date.now();
    if (len > 120) currentMorse += "-";
    else currentMorse += ".";
    mouseDown = false;
    morseButton.style.backgroundColor = "#cccccc";
    updateButtonText();
  }

  morseButton.addEventListener("mousedown", morse_down);
  morseButton.addEventListener("mouseup", morse_up);

  document.addEventListener("keydown", (e) => {
    if (tabIsActive() && !e.repeat && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      morse_down();
    }
  });
  document.addEventListener("keyup", (e) => {
    if (tabIsActive() && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      morse_up();
    }
  });

  function newLetter() {
    targetLetter.innerText = String.fromCharCode(
      65 + Math.floor(Math.random() * 26)
    );
    actualLetter.innerText = "";
  }

  async function flashCorrect() {
    animation = true;
    tab.style.backgroundColor = "#DDFFDD";
    await sleep(100);
    tab.style.backgroundColor = "white";
    animation = false;
    newLetter();
  }

  async function flashWrong() {
    tab.style.backgroundColor = "#FFDDDD";
    await sleep(100);
    tab.style.backgroundColor = "white";
  }

  setInterval(async () => {
    if (
      !animation &&
      currentMorse.length > 0 &&
      !mouseDown &&
      Date.now() - last_time > 240
    ) {
      if (morseToLetter[currentMorse]) {
        actualLetter.innerText = morseToLetter[currentMorse].toUpperCase();
        if (actualLetter.innerText === targetLetter.innerText) {
          flashCorrect();
        } else {
          flashWrong();
        }
      } else {
        actualLetter.innerText = "";
        flashWrong();
      }
      currentMorse = "";
      updateButtonText();
    }
  }, 1000 / 60);

  newLetter();
})();
