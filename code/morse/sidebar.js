const sidebar = document.getElementById("sidebar");
const sidebarElements = [
  { id: "input-letter-tab", name: "Letter\n\u2193\nMorse" },
  { id: "output-letter-tab", name: "Morse\n\u2193\nLetter" },
  // { id: "input-word-tab", name: "Word\n\u2193\nMorse" },
  // { id: "output-word-tab", name: "Morse\n\u2193\nWord" },
];

const isActive = {};

let currentTabId;

function switchTab(id) {
  if (currentTabId) {
    isActive[currentTabId] = false;
    document.getElementById(currentTabId).style.display = "none";
    document.getElementById(currentTabId + "-button").style.backgroundColor =
      "gray";
  }
  isActive[id] = true;
  currentTabId = id;
  document.getElementById(id).style.display = "block";
  document.getElementById(id + "-button").style.backgroundColor = "#aaaaaa";
}

for (const element of sidebarElements) {
  isActive[element.id] = false;
  let button = document.createElement("div");
  button.id = element.id + "-button";
  button.classList.add("sidebar-button");
  button.innerText = element.name;
  sidebar.appendChild(button);
  let id = element.id;
  button.addEventListener("click", () => {
    switchTab(id);
  });
}

switchTab(sidebarElements[0].id);
