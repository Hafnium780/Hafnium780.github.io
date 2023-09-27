const checkInterval = setInterval(() => {
  if (
    document.querySelectorAll(".course-event:not(.hidden-important)").length > 0
  ) {
    start();
    clearInterval(checkInterval);
  }
}, 500);

const makeToDoElementHTML = (
  toDoDescription,
  dueDate,
  id,
  link = undefined
) => {
  return (
    `
    <div style="width: 100%; display: flex; margin-top: 10px;">
      <div style="background-image: none; background-color: blue; padding-top: 0px; width: 16px; height: 16px; flex: 0 0 16px"></div>
      <div style="margin: 0px 10px; flex: 1 0;">
        <div style="display: flex; flex-direction: column">
          <div>Description</div>
          <pre contenteditable style="color: #333; background-color: white; padding: 2px; font: 12px var(--sgy-font-default); border: 1px solid rgb(118, 118, 118); display: block; max-height: 100px; overflow: auto;" onfocusout="window.postMessage({type: 'toDoDescriptionCB', id: ` +
    id +
    `, value: this.innerText}, '*')">` +
    toDoDescription +
    `</pre>
        </div>
        <div style="display: flex;">
          <span style="margin-right: 2px">Due</span>
          <input style="color: #333; font: 12px var(--sgy-font-default);" value="` +
    dueDate +
    `" onfocusout="window.postMessage({type: 'dueDateCB', id: ` +
    id +
    `, value: this.value}, '*')"></input>
        </div>
      </div>
    </div>`
  );
};

window.addEventListener("message", (e) => {
  try {
    if (e.data.type === "toDoDescriptionCB") {
      for (const i in addedToDos) {
        if (addedToDos[i].id === e.data.id) {
          addedToDos[i].toDoDescription = e.data.value;
          break;
        }
      }
      console.log("id " + e.data.id + " updated desc to " + e.data.value);
      chrome.storage.sync.set({ addedToDos: addedToDos });
    } else if (e.data.type === "dueDateCB") {
      for (const i in addedToDos) {
        if (addedToDos[i].id === e.data.id) {
          addedToDos[i].dueDate = e.data.value;
          break;
        }
      }
      console.log("id " + e.data.id + " updated date to " + e.data.value);
      chrome.storage.sync.set({ addedToDos: addedToDos });
    }
  } catch (e) {}
});

let addedToDos, currentId;

const start = async () => {
  try {
    addedToDos =
      (await chrome.storage.sync.get(["addedToDos"])).addedToDos ?? [];
    currentId = (await chrome.storage.sync.get(["currentId"])).currentId ?? 0;
  } catch (e) {
    addedToDos = [];
    currentId = 0;
  }
  const toDoWrapper = document.querySelector(
    ".upcoming-submissions.upcoming-submissions-wrapper"
  );
  const addButton = document.createElement("div");
  toDoWrapper.prepend(addButton);
  addButton.style =
    "width: 100%; height: 20px; text-align: center; background-color: #dddddd";
  addButton.innerText = "Add Custom To Do";
  addButton.addEventListener("click", () => {
    currentId++;
    addedToDos.push({
      toDoDescription: "Description",
      dueDate: "Due Date",
      id: currentId,
      link: "",
    });
    upcomingListDiv.innerHTML =
      makeToDoElementHTML("Description", "Due Date", currentId, "") +
      upcomingListDiv.innerHTML;
    chrome.storage.sync.set({ currentId: currentId });
    chrome.storage.sync.set({ addedToDos: addedToDos });
  });
  // document.querySelectorAll(".course-event:not(.hidden-important)");
  const upcomingListDiv = document.getElementsByClassName("upcoming-list")[0];
  try {
    for (const addedToDo of addedToDos) {
      upcomingListDiv.innerHTML =
        makeToDoElementHTML(
          addedToDo.toDoDescription,
          addedToDo.dueDate,
          addedToDo.id,
          addedToDo.link
        ) + upcomingListDiv.innerHTML;
    }
  } catch (e) {}
};
