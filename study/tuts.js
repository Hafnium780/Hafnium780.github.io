// Handles tut(ee/or) columns

// HTML elements
const tuteeInput = document.getElementById("tutee-file");
const tutorInput = document.getElementById("tutor-file");

const tuteeDiv = document.getElementById("tutees");
const tutorDiv = document.getElementById("tutors");

// filter tutors when tutee selected?
const filter = true;

let tutors = [],
  tutees = [];
let selectedTuteeID = undefined;

document.addEventListener("keydown", (e) => {
  if (e.key == "Escape") {
    clearHightlighting();
    refresh();
  }
});

// Load previous data from localStorage
const loadData = () => {
  tutees = JSON.parse(localStorage.getItem("tutees") || "[]");
  tutors = JSON.parse(localStorage.getItem("tutors") || "[]");
  pairings = JSON.parse(localStorage.getItem("pairings") || "[]");
  refresh();
};

// Save data to localStorage
const saveData = () => {
  localStorage.setItem("tutees", JSON.stringify(tutees));
  localStorage.setItem("tutors", JSON.stringify(tutors));
  localStorage.setItem("pairings", JSON.stringify(pairings));
};

// Clears highlighting of all tutees/tutors
const clearHightlighting = () => {
  for (const t of tutors) {
    t.div.classList.remove("highlight");
    t.div.classList.remove("select");
  }
  for (const t of tutees) {
    t.div.classList.remove("highlight");
    t.div.classList.remove("select");
  }
  selectedTuteeID = undefined;
};

// Clears the div containing tutees
const clearTuteeDiv = () => {
  tuteeDiv.innerHTML = "";
};

// Clears the div containing tutors
const clearTutorDiv = () => {
  tutorDiv.innerHTML = "";
};

// Hides the divs with tutors that don't match with selected tutee or are already paired
const hideFilteredTutors = () => {
  for (const t of tutors) {
    if (!t.div.classList.contains("highlight")) {
      t.div.style = "display:none";
    } else {
      let w = false;
      for (const p of pairings) {
        if (selectedTuteeID == p.tuteeID && t.id == p.tutorID) {
          w = true;
          break;
        }
      }
      if (w) {
        t.div.style = "display:none";
      }
    }
  }
};

// Handling a new file input for tutees
tuteeInput.addEventListener("change", () => {
  if (tuteeInput.files.length == 1) {
    // console.log("File selected: ", tuteeInput.files[0]);
    parseTuteeFile(tuteeInput.files[0]);
  }
});

// Handling a new file input for tutors
tutorInput.addEventListener("change", () => {
  if (tutorInput.files.length == 1) {
    // console.log("File selected: ", tutorInput.files[0]);
    parseTutorFile(tutorInput.files[0]);
  }
});

const parseTuteeFile = (f) => {
  const reader = new FileReader();
  reader.readAsText(f, "UTF-8");
  reader.onload = (e) => {
    tutees = [];
    pairings = [];
    processTutees(parse(e.target.result));
  };
};

const parseTutorFile = (f) => {
  const reader = new FileReader();
  reader.readAsText(f, "UTF-8");
  reader.onload = (e) => {
    tutees = [];
    pairings = [];
    processTutors(parse(e.target.result));
  };
};

// Takes a parsed tutee csv file and populates the tutee array
const processTutees = (input) => {
  for (const row of input) {
    // console.log(row);
    if (row[0] == "" || row[0] == "Timestamp") continue;
    const times = row[14].trim().split(", ");
    for (let i = times.length - 1; i >= 0; i--) {
      times[i] = times[i].trim();
      if (times[i][0] >= "0" && times[i][0] <= "9") {
        times[i - 1] += ": " + times[i];
        times.splice(i, 1);
      }
    }
    // now all times should be in format of ~ [day] (period): [start] - [end]
    for (let i = 0; i < times.length; i++) {
      const sections = times[i].split(" ");
      //   console.log(sections);
      let addingTime = false;
      let time = "";
      for (let j = 0; j < sections.length; j++) {
        const s = sections[j];
        if (addingTime) {
          time += s;
        }
        if (s[s.length - 1] == ":") {
          addingTime = true;
          sections[j] = s.substring(0, s.length - 1);
        }
      }

      for (let j = time.length - 1; j >= 0; j--) {
        if ((time[j] >= "0" && time[j] <= "9") || time[j] == "-") continue;
        time = time.substring(0, j) + time.substring(j + 1, time.length);
      }
      if (time == "") {
        time = {
          start: afterSchoolStart[sections[0]],
          end: afterSchoolEnd[sections[0]],
        };
      } else {
        const times = time.split("-");
        try {
          time = { start: parseInt(times[0]), end: parseInt(times[1]) };
        } catch (e) {}
      }
      times[i] = { day: sections[0], time: time };
    }
    const t = new Tutee(
      row[1].trim(),
      row[2].trim(),
      row[3].trim(),
      row[4].trim(),
      row[5].trim(),
      row[6].trim(),
      row[7].trim(),
      row[8].trim().split(", ").sort(),
      times.sort(),
      [
        row[9].trim(),
        row[10].trim(),
        row[11].trim(),
        row[12].trim(),
        row[13].trim(),
      ]
    );
    // console.log(t);
    tutees.push(t);
  }
  refresh();
};

// Takes a parsed tutor csv file and populates the tutor array
const processTutors = (input) => {
  for (const row of input) {
    // console.log(row);
    if (row[0] == "" || row[0] == "Timestamp") continue;
    const times = row[9].trim().split(", ");
    for (let i = times.length - 1; i >= 0; i--) {
      times[i] = times[i].trim();
      if (times[i][0] >= "0" && times[i][0] <= "9") {
        times[i - 1] += ": " + times[i];
        times.splice(i, 1);
      }
    }
    // now all times should be in format of ~ [day] (period): [start] - [end]
    for (let i = 0; i < times.length; i++) {
      const sections = times[i].split(" ");
      //   console.log(sections);
      let addingTime = false;
      let time = "";
      for (let j = 0; j < sections.length; j++) {
        const s = sections[j];
        if (addingTime) {
          time += s;
        }
        if (s[s.length - 1] == ":") {
          addingTime = true;
          sections[j] = s.substring(0, s.length - 1);
        }
      }

      for (let j = time.length - 1; j >= 0; j--) {
        if ((time[j] >= "0" && time[j] <= "9") || time[j] == "-") continue;
        time = time.substring(0, j) + time.substring(j + 1, time.length);
      }
      if (time == "") {
        time = {
          start: afterSchoolStart[sections[0]],
          end: afterSchoolEnd[sections[0]],
        };
      } else {
        const times = time.split("-");
        try {
          time = { start: parseInt(times[0]), end: parseInt(times[1]) };
        } catch (e) {}
      }
      times[i] = { day: sections[0], time: time };
    }
    const t = new Tutor(
      row[1].trim(),
      row[2].trim(),
      row[3].trim(),
      row[4].trim(),
      row[5].trim(),
      row[6].trim(),
      row[7].trim(),
      row[8].trim().split(", ").sort(),
      times.sort()
    );
    // console.log(t);
    tutors.push(t);
  }
  refresh();
};

// Refreshes all the displays (called every time a tutee/tutor is selected, a pairing is changed; very inefficient but there aren't many entries)
const refresh = () => {
  displayTutees();
  displayTutors();
  displayPairings();
  saveData();
};

// Displays the tutees in the tutees array
const displayTutees = () => {
  clearTuteeDiv();
  for (const t of tutees) {
    const newTuteeDiv = document.createElement("div");
    const newTuteeDivName = document.createElement("div");
    const newTuteeDivSubjects = document.createElement("div");
    const newTuteeDivTimes = document.createElement("div");
    const newTuteeDivCount = document.createElement("div");
    newTuteeDivName.innerText = t.first + " " + t.last + ", " + t.grade + "th";
    newTuteeDivSubjects.innerHTML = "";
    for (const s of getUnmatchedSubjects(t))
      newTuteeDivSubjects.innerHTML += s + "<br>";

    newTuteeDivTimes.innerHTML = "";
    for (const ti of getUnmatchedTimes(t))
      newTuteeDivTimes.innerHTML += ti + "<br>";

    const validTutorCount = getValidTutors(t.id).length;
    newTuteeDivCount.innerText = "Tutors: " + validTutorCount;

    newTuteeDiv.appendChild(newTuteeDivName);
    newTuteeDiv.appendChild(newTuteeDivSubjects);
    newTuteeDiv.appendChild(newTuteeDivTimes);
    newTuteeDiv.appendChild(newTuteeDivCount);
    tuteeDiv.appendChild(newTuteeDiv);

    newTuteeDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      let selected = t.div.classList.contains("select");
      clearHightlighting();
      if (!selected) selectedTuteeID = t.id;
      refresh();
    });

    newTuteeDiv.classList.add("tutee-div");
    newTuteeDivName.classList.add("tutee-div-name");
    newTuteeDivSubjects.classList.add("tutee-div-subjects");
    newTuteeDivTimes.classList.add("tutee-div-times");
    newTuteeDivCount.classList.add("tutee-div-count");

    if (getUnmatchedSubjects(t).length == 0)
      newTuteeDiv.classList.add("tutee-done");

    t.div = newTuteeDiv;

    if (selectedTuteeID == t.id) newTuteeDiv.classList.add("select");
  }
};

// Displays the tutors in the tutors array
const displayTutors = () => {
  clearTutorDiv();
  for (const t of tutors) {
    const newTutorDiv = document.createElement("div");
    const newTutorDivName = document.createElement("div");
    const newTutorDivSubjects = document.createElement("div");
    const newTutorDivTimes = document.createElement("div");
    newTutorDivName.innerText = t.first + " " + t.last + ", " + t.grade + "th";
    newTutorDivSubjects.innerHTML = "";
    if (selectedTuteeID && filter)
      for (const s of getMutualSubjectsID(selectedTuteeID, t.id))
        newTutorDivSubjects.innerHTML += s + "<br>";
    else
      for (const s of t.subjects) newTutorDivSubjects.innerHTML += s + "<br>";

    newTutorDivTimes.innerHTML = "";
    if (selectedTuteeID && filter)
      for (const ti of getMutualTimesID(selectedTuteeID, t.id))
        newTutorDivTimes.innerHTML += ti + "<br>";
    else
      for (const ti of getUnmatchedTimesTutor(t))
        newTutorDivTimes.innerHTML += ti + "<br>";

    newTutorDiv.appendChild(newTutorDivName);
    newTutorDiv.appendChild(newTutorDivSubjects);
    newTutorDiv.appendChild(newTutorDivTimes);
    tutorDiv.appendChild(newTutorDiv);

    newTutorDiv.addEventListener("click", () => {
      if (newTutorDiv.classList.contains("highlight")) {
        addPairing(selectedTuteeID, t.id);
      }
    });

    newTutorDiv.classList.add("tutor-div");
    newTutorDivName.classList.add("tutor-div-name");
    newTutorDivSubjects.classList.add("tutor-div-subjects");
    newTutorDivTimes.classList.add("tutor-div-times");

    t.div = newTutorDiv;
  }

  // Highlight/filter tutors
  if (selectedTuteeID) {
    for (const id of getValidTutors(selectedTuteeID)) {
      getTutorByID(id).div.classList.add("highlight");
    }

    if (filter) hideFilteredTutors();
  }
};
