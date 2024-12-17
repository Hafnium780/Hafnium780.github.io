var turn = document.getElementsByClassName("selfTurn")[0];
var syl = document.getElementsByClassName("syllable")[0];
var entry = document.querySelector(".selfTurn form input");
var form = document.querySelector(".selfTurn form");
var canvasArea = document.getElementsByClassName("canvasArea")[0];

let mute = document.querySelector("body>div:not([class])");
mute.remove();

let inject = document.createElement("div");

// var injectDOM = new DOMParser().parseFromString(inject, "text/html");
// console.log(injectDOM);
inject.innerHTML = `
  <div id="injected">
    <div class="option">
      <label class="toggle">
        <input class="enable toggle-checkbox" type="checkbox">
        <div class="toggle-switch"></div>
      </label><span class="text-label">Enabled</span>
    </div>
    <div class="option">
      <label class="toggle">
        <input class="use-common toggle-checkbox" type="checkbox">
        <div class="toggle-switch"></div>
      </label><span class="text-label">Use Common Words</span>
    </div>
    <div class="option">
      <label class="toggle">
        <input class="lessnesses toggle-checkbox" type="checkbox">
        <div class="toggle-switch"></div>
      </label><span class="text-label">LESSNESSES</span>
    </div>
    <div class="option">
      <input type="number" id="length" min="1" max="25" value="25"><span class="text-label">Max Length</span>
      <script src="popup.js"></script>
    </div>
    <div class="option">
      <label class="toggle">
        <input class="type toggle-checkbox" type="checkbox">
        <div class="toggle-switch"></div>
      </label><span class="text-label">Type</span>
    </div>
    <div class="option">
      <input id="interval" type="range" min="1" max="200" step="1" value="200"></input><p class="typing-speed text-label">Typing Speed: ~5 LPS</p>
    </div>
  </div>`;

canvasArea.appendChild(inject);

let enableb = document.getElementsByClassName("enable")[0];
let useCommonb = document.getElementsByClassName("use-common")[0];
let lessnessesb = document.getElementsByClassName("lessnesses")[0];
let typeb = document.getElementsByClassName("type")[0];
let lengthb = document.getElementById("length");
let typesb = document.getElementById("interval");
let typel = document.getElementsByClassName("typing-speed")[0];

let enabled = false,
  useCommon = false,
  lessnesses = false,
  typing = false,
  length = 25,
  typingInterval = 200;

enableb.addEventListener("change", (e) => {
  enabled = e.target.checked;
  if (enabled) {
    run();
  } else {
    end();
  }
});

useCommonb.addEventListener("change", (e) => {
  useCommon = e.target.checked;
});

lessnessesb.addEventListener("change", (e) => {
  lessnesses = e.target.checked;
});

typeb.addEventListener("change", (e) => {
  typing = e.target.checked;
});

lengthb.addEventListener("change", (e) => {
  length = e.target.value;
});

typesb.addEventListener("change", (e) => {
  typingInterval = parseInt(e.target.value);
  typel.innerText =
    "Typing Speed: ~" + Math.round(100000 / typingInterval) / 100 + " LPS";
});

// chrome.runtime.onMessage.addListener((msg) => {
//   if (msg.type === "enable") {
//     enabled = msg.enabled;
//     if (enabled) {
//       run();
//     } else {
//       end();
//     }
//   } else if (msg.type === "lessnesses") {
//     lessnesses = msg.enabled;
//   } else if (msg.type === "type") {
//     typing = msg.enabled;
//   } else if (msg.type === "length") {
//     length = msg.length;
//   }
// });

// chrome.storage.local.get(["enable"]).then((v) => {
//   enabled = v.enable;
//   if (enabled) setTimeout(run, 1000);
// });
// chrome.storage.local
//   .get(["lessnesses"])
//   .then((v) => (lessnesses = v.lessnesses));
// chrome.storage.local.get(["type"]).then((v) => (typing = v.type));
// chrome.storage.local.get(["length"]).then((v) => (length = v.length));

let toType = "";

let used, words;
let usedLetters = Array(24).fill(false);

fetch(chrome.runtime.getURL("dict.txt"))
  .then((response) => response.text())
  .then((data) => {
    words = data.split(/\r?\n/);
    words.pop();
    used = Array(words.length).fill(false);
  });

fetch(chrome.runtime.getURL("dict_common.txt"))
  .then((response) => response.text())
  .then((data) => {
    commonWords = data.split(/\r?\n/);
    for (let i = 0; i < commonWords.length; i++) {
      commonWords[i] = commonWords[i].toUpperCase();
    }
  });

let interval = undefined;
let pause = 0;

function run() {
  if (interval !== undefined) clearInterval(interval);
  interval = setInterval(() => {
    if (pause > 0) {
      pause--;
      return;
    }
    if (turn.innerText == "" && (toType == "" || !typing)) {
      let maxScore = 0;
      let maxStr = "";
      let maxi = 0;
      let maxScore1 = 0;
      let maxStr1 = "";
      let maxi1 = 0;
      let sub = syl.innerText;
      for (let i = 0; i < words.length; i++) {
        if (!used[i] && words[i].includes(sub)) {
          let score = evalStr(words[i]);
          if (words[i].length <= length) {
            if (
              score > maxScore ||
              (score == maxScore && words[i].length > words[maxi].length)
            ) {
              maxScore = score;
              maxi = i;
              maxStr = words[i];
            }
          }
          if (
            score > maxScore1 ||
            (score == maxScore1 && words[i].length > words[maxi1].length)
          ) {
            maxScore1 = score;
            maxi1 = i;
            maxStr1 = words[i];
          }
        }
      }
      if (maxStr == "") {
        maxStr = maxStr1;
        maxi = maxi1;
      }
      used[maxi] = true;
      for (let i = 0; i < maxStr.length; i++) {
        let index = ind(maxStr[i]);
        if (index != -1) usedLetters[index] = true;
      }
      let done = true;
      for (let i = 0; i < usedLetters.length; i++) {
        done = done && usedLetters[i];
      }
      if (done) usedLetters.fill(false);
      if (typing) {
        // toType = "";

        // for (let i = 0; i < maxStr.length; i++) {
        //   toType = maxStr[i] + "|";
        // }
        toType = maxStr;

        setTimeout(type, 1000);
      } else {
        entry.value = maxStr;
        form.dispatchEvent(new Event("submit"));
      }
    }
  }, 500);

  function evalStr(s) {
    let score = 0;
    if (useCommon && commonWords.includes(s)) {
      score = 10000;
    }
    if (lessnesses && s.substring(s.length - 10, s.length) == "LESSNESSES")
      score = 10000;
    for (let i = 0; i < s.length; i++) {
      let index = ind(s[i]);
      if (index != -1 && !usedLetters[index]) score++;
    }
    return score;
  }

  function ind(c) {
    let d = c.charCodeAt(0) - "A".charCodeAt(0);
    if (d >= 23) {
      if (d == 24) return 23;
      return -1;
    }
    return d;
  }
}

function type() {
  entry.value += toType[0];
  toType = toType.substring(1, toType.length);
  entry.dispatchEvent(new Event("input"));
  if (toType != "") {
    setTimeout(type, Math.floor(Math.random() * 100 + typingInterval));
  } else {
    form.dispatchEvent(new Event("submit"));
    pause = 2;
  }
}

function end() {
  if (interval !== undefined) clearInterval(interval);
  interval = undefined;
}
