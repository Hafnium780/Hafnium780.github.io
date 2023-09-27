const checkInterval = setInterval(() => {
  if (document.getElementById("wrapper") == null) return;
  clearInterval(checkInterval);
  start();
}, 100);

let key, signature;

const getContent = async (a) => {
  return await chrome.runtime.sendMessage({
    type: "getContent",
    url: a,
  });
};

const getHTML = async (a) => {
  return await chrome.runtime.sendMessage({
    type: "getHTML",
    url: a,
  });
};

const multiGet = async (b) => {
  return await chrome.runtime.sendMessage({
    type: "multiGet",
    data: b,
  });
};

const updateKeyInfo = async () => {
  ({ key, signature } = await chrome.storage.local.get(["key", "signature"]));
  await chrome.runtime.sendMessage({
    type: "setLogin",
    key: key,
    signature: signature,
  });
};

const sections = {};

const msPerDay = 24 * 60 * 60 * 1000;
function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0);
  end.setHours(0, 0, 1);
  return (end - start) / msPerDay;
}

function daysUntil(timestamp) {
  if (isNaN(timestamp)) return "__";
  const days = Math.floor(daysBetween(Date.now(), timestamp));
  if (days == 1) return "tomorrow";
  if (days == -1) return "yesterday";
  if (days < -1) return -days + " days ago";
  if (days > 1) return "in " + days + " days";
  return "today";
}

const mainWrapper = document.createElement("div");
const toDoDetails = { wrapper: document.createElement("div") };

const start = async () => {
  document.getElementById("wrapper").innerHTML = `<style>
  .reset-button {position: absolute; background-color: red; top: 0px; left: 0px; z-index: 100;}

  html {overflow: hidden;} 
  #wrapper {margin: 0px; padding: 0px; display: flex; overflow: hidden; width: 100vw; max-width: 100vw;}
  .main-wrapper {overflow: hidden; overflow-y: scroll; height: calc(100vh - 12rem); margin: 0px; width: 50vw;} 
  .todo-div {padding: 4px; background-color: white; width: 100%; height: 60px; display: flex; flex-direction: column; transition: filter ease 100ms; cursor: pointer;}
  .todo-div:hover {filter: brightness(0.9);}
  .name-div {color: var(--link-color); font-weight: bold;}



  .detail-wrapper {width: 50vw;}

  .name-div-text {padding: 5px; color: var(--link-color); font-weight: bold; font-size: 20px;}
  .name-div-text-entry {padding: 5px; color: var(--link-color); font-weight: bold; font-size: 20px; background-color: rgba(0, 0, 0, 0.1)}
  .name-div-edit {color: var(--link-color); font-size: 10px; cursor: pointer;}
  .name-div-edit:hover {text-decoration: underline;}

  .description-div-text {padding: 5px;}
  .description-div-text-entry {padding: 5px; background-color: rgba(0, 0, 0, 0.1)}
  .description-div-edit {color: var(--link-color); font-size: 10px; cursor: pointer;}
  .description-div-edit:hover {text-decoration: underline;}

  .new-todo {position: absolute; left: 0px; bottom: 6rem; margin-top: auto; width: 50%; height: 40px; background-color: white; text-align: center; line-height: 40px;}

  </style>`;
  mainWrapper.classList.add("main-wrapper");
  toDoDetails.wrapper.classList.add("detail-wrapper");
  document.getElementById("wrapper").append(toDoDetails.wrapper);
  document.getElementById("wrapper").append(mainWrapper);
  setupToDoDetails();

  todos = (await chrome.storage.local.get(["todos"])).todos ?? [];
  currentId = (await chrome.storage.local.get(["currentId"])).currentId ?? 0;
  updateToDoDisplay();

  await updateKeyInfo();

  const uid = (await getContent("app-user-info")).api_uid;

  const sectionsResponse = (await getContent(`users/${uid}/sections`)).section;

  let sectionMultiGet = `<?xml version="1.0" encoding="utf-8" ?><requests>`;

  const sectionIdOrder = [];
  for (const section of sectionsResponse) {
    sections[section.id] = { name: section.course_title };
    sectionIdOrder.push(section.id);
    sectionMultiGet += `<request>/v1/sections/${section.id}/assignments?limit=1000</request>`;
  }

  sectionMultiGet += `</requests>`;

  const assignments = [];

  const multiGetResponse = (await multiGet(sectionMultiGet)).response;

  let i = 0;
  for (const sectionResponse of multiGetResponse) {
    for (const assignment of sectionResponse.body.assignment) {
      assignments.push({
        id: assignment.id,
        name: assignment.title,
        dueDate: assignment.due,
        timestamp: Date.parse(assignment.due),
        description: assignment.description,
        sectionId: sectionIdOrder[i],
      });
    }
    i++;
  }

  for (const assignment of assignments) {
    const toDo = findToDo(assignment.id);
    if (toDo) {
      toDo.id = assignment.id;
      toDo.name = assignment.name;
      toDo.timestamp = toDo.timestamp;
      toDo.section = sections[assignment.sectionId].name;
      toDo.description = assignment.description;
    } // update info maybe
    else {
      todos.push(
        new ToDo(
          assignment.id,
          assignment.name,
          assignment.timestamp,
          sections[assignment.sectionId].name,
          assignment.description
        )
      );
    }

    // document.write(
    //   // assignment.timestamp,
    //   // "\t",
    //   "\t",
    //   daysUntil(assignment.timestamp),
    //   assignment.dueDate,
    //   "\t",
    //   sections[assignment.sectionId].name,
    //   "\t",
    //   assignment.name,
    //   "<br>"
    // );
  }

  updateToDoDisplay();
};

const formatDate = (timestamp) => {
  return (
    "Due " +
    new Date(timestamp).toLocaleString("en-US", {
      weekday: "short",
      year: "2-digit",
      day: "numeric",
      month: "numeric",
      hour: "numeric",
      minute: "numeric",
      // second: "numeric",
      hour12: true,
    }) +
    " (" +
    daysUntil(timestamp) +
    ")"
  );
};

const addNewToDo = (name, timestamp, section = "", description = "") => {
  todos.push(new ToDo(currentId, name, timestamp, section, description));
  currentId++;
  chrome.storage.local.set({ currentId: currentId });
  updateToDoDisplay();
};

const updateToDoDisplay = () => {
  chrome.storage.local.set({ todos: todos });

  mainWrapper.innerHTML = "";

  todos.sort((a, b) => {
    if (isNaN(a.timestamp)) return -1;
    else if (isNaN(b.timestamp)) return 1;
    return a.timestamp - b.timestamp;
  });

  for (const todo of todos) {
    if (Math.floor(daysBetween(Date.now(), todo.timestamp)) >= 0)
      ToDo.createToDoDiv(todo, mainWrapper, () => {
        showToDoDetails(todo);
      });
  }
};

const findToDo = (id) => {
  for (const todo of todos) {
    if (todo.id === id) return todo;
  }
  return undefined;
};

const setupToDoDetails = () => {
  toDoDetails.wrapper.innerHTML = "";

  // Name
  toDoDetails.nameDiv = document.createElement("div");
  toDoDetails.nameDivText = document.createElement("span");
  toDoDetails.nameDivTextEntry = document.createElement("span");
  toDoDetails.nameDivTextEntry.setAttribute("contenteditable", true);
  toDoDetails.nameDivEdit = document.createElement("span");

  toDoDetails.nameDiv.classList.add("name-div-detail");
  toDoDetails.nameDivText.classList.add("name-div-text");
  toDoDetails.nameDivTextEntry.classList.add("name-div-text-entry");
  toDoDetails.nameDivEdit.classList.add("name-div-edit");

  toDoDetails.wrapper.append(toDoDetails.nameDiv);
  toDoDetails.nameDiv.append(toDoDetails.nameDivText);
  toDoDetails.nameDiv.append(toDoDetails.nameDivTextEntry);
  toDoDetails.nameDiv.append(toDoDetails.nameDivEdit);
  toDoDetails.nameDivEdit.addEventListener("click", () => {
    toDoDetails.nameDivTextEntry.innerText = toDoDetails.nameDivText.innerText;
    toDoDetails.nameDivTextEntry.style.display = "inline";
    toDoDetails.nameDivText.style.display = "none";
    toDoDetails.nameDivTextEntry.focus();
  });

  toDoDetails.nameDivTextEntry.addEventListener("focusout", () => {
    toDoDetails.nameDivTextEntry.blur();
    currentToDo.name = toDoDetails.nameDivTextEntry.innerText;
    updateToDoDisplay();
    showToDoDetails(currentToDo);
  });

  // Due Date
  toDoDetails.dueDateDiv = document.createElement("div");
  // toDoDetails.dueDatedivEdit = document.createElement("div");

  toDoDetails.dueDateDiv.classList.add("due-date-div-detail");

  toDoDetails.wrapper.append(toDoDetails.dueDateDiv);

  // Description
  toDoDetails.descriptionDiv = document.createElement("div");
  toDoDetails.descriptionDivText = document.createElement("span");
  toDoDetails.descriptionDivTextEntry = document.createElement("span");
  toDoDetails.descriptionDivTextEntry.setAttribute("contenteditable", true);
  toDoDetails.descriptionDivEdit = document.createElement("span");

  toDoDetails.descriptionDiv.classList.add("description-div-detail");
  toDoDetails.descriptionDivText.classList.add("description-div-text");
  toDoDetails.descriptionDivTextEntry.classList.add(
    "description-div-text-entry"
  );
  toDoDetails.descriptionDivEdit.classList.add("description-div-edit");

  toDoDetails.wrapper.append(toDoDetails.descriptionDiv);
  toDoDetails.descriptionDiv.append(toDoDetails.descriptionDivText);
  toDoDetails.descriptionDiv.append(toDoDetails.descriptionDivTextEntry);
  toDoDetails.descriptionDiv.append(toDoDetails.descriptionDivEdit);
  toDoDetails.descriptionDivEdit.addEventListener("click", () => {
    toDoDetails.descriptionDivTextEntry.innerText =
      toDoDetails.descriptionDivText.innerText;
    toDoDetails.descriptionDivTextEntry.style.display = "inline";
    toDoDetails.descriptionDivText.style.display = "none";
    toDoDetails.descriptionDivTextEntry.focus();
  });

  toDoDetails.descriptionDivTextEntry.addEventListener("focusout", () => {
    toDoDetails.descriptionDivTextEntry.blur();
    currentToDo.description = toDoDetails.descriptionDivTextEntry.innerText;
    updateToDoDisplay();
    showToDoDetails(currentToDo);
  });

  // new

  toDoDetails.newToDo = document.createElement("div");
  toDoDetails.newToDo.classList.add("new-todo");
  toDoDetails.newToDo.innerText = "Add New Todo";
  toDoDetails.wrapper.append(toDoDetails.newToDo);

  toDoDetails.newToDo.addEventListener("click", () => {
    addNewToDo("New Todo", Date.now() + 604800000, "test", "asdf");
  });

  /* temporary things*/
  const resetButton = document.createElement("div");
  resetButton.innerText = "RESET";
  resetButton.classList.add("reset-button");
  resetButton.addEventListener("click", reset);
  document.body.append(resetButton);
  /**/

  showToDoDetails(undefined);
};

const reset = async () => {
  chrome.storage.local.remove("todos", () => {
    chrome.storage.local.remove("currentId", () => {
      location.reload();
    });
  });
};

let currentToDo;

const showToDoDetails = (toDo = undefined) => {
  toDoDetails.nameDivTextEntry.style.display = "none";
  toDoDetails.nameDivText.style.display = "inline";
  toDoDetails.descriptionDivTextEntry.style.display = "none";
  toDoDetails.descriptionDivText.style.display = "inline";
  currentToDo = toDo;
  if (toDo) {
    toDoDetails.nameDivEdit.innerText = "edit";
    toDoDetails.nameDivText.innerText = toDo.name;
    toDoDetails.descriptionDivEdit.innerText = "edit";
    toDoDetails.descriptionDivText.innerText = toDo.description;
    toDoDetails.dueDateDiv.innerText = formatDate(toDo.timestamp);
  } else {
    toDoDetails.nameDivEdit.innerText = "";
    toDoDetails.nameDivText.innerText = "";
    toDoDetails.descriptionDivEdit.innerText = "";
    toDoDetails.descriptionDivText.innerText = "";
    toDoDetails.dueDateDiv.innerText = "";
  }
};

let todos;

class ToDo {
  constructor(id, name, timestamp, section = "", description = "") {
    this.id = id;
    this.name = name;
    this.timestamp = timestamp;
    this.section = section;
    this.description = description;
  }

  static createToDoDiv(toDo, mainWrapper, clickCallback) {
    toDo.div = document.createElement("div");
    const nameDiv = document.createElement("div");
    const sectionDiv = document.createElement("div");
    const dueDateDiv = document.createElement("div");
    toDo.div.classList.add("todo-div");
    nameDiv.classList.add("name-div");
    sectionDiv.classList.add("section-div");
    dueDateDiv.classList.add("due-date-div");
    nameDiv.innerText = toDo.name;
    sectionDiv.innerText = toDo.section;
    dueDateDiv.innerText = formatDate(toDo.timestamp);

    toDo.div.append(nameDiv);
    toDo.div.append(sectionDiv);
    toDo.div.append(dueDateDiv);
    mainWrapper.append(toDo.div);
    toDo.div.addEventListener("click", clickCallback);
  }
}
