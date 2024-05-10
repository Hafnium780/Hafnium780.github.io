// Shows the assigned times and subjects for tutees and tutors

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// HTML elements
const tuteeInput = document.getElementById("tutee-file");
const tutorInput = document.getElementById("tutor-file");

const tuteeDiv = document.getElementById("tutees");
const tutorDiv = document.getElementById("tutors");

document.getElementById("export").addEventListener("click", () => {
  exportTuteeDataToSpreadsheet("\t");
  exportTutorDataToSpreadsheet("\t");
});

document.getElementById("copy-tutor").addEventListener("click", () => {
  navigator.clipboard.writeText(exportTutorDataToSpreadsheet("\t"));
});

document.getElementById("copy-tutee").addEventListener("click", () => {
  navigator.clipboard.writeText(exportTuteeDataToSpreadsheet("\t"));
});

let tutors = [],
  tutees = [],
  pairings = [];

const getTutorByID = (id) => {
  for (const t of tutors) if (t.id === id) return t;
  return null;
};

// Get a tutee by their student ID
const getTuteeByID = (id) => {
  for (const t of tutees) if (t.id === id) return t;
  return null;
};

// Is the given match a time? if not, it is a subject
const isMatchTime = (m) => {
  return days.includes(m.split(" ")[0]);
};

// Load previous data from localStorage
const loadData = () => {
  tutees = JSON.parse(localStorage.getItem("tutees") || "[]");
  tutors = JSON.parse(localStorage.getItem("tutors") || "[]");
  pairings = JSON.parse(localStorage.getItem("pairings") || "[]");
  refresh();
};

// Clears the div containing tutees
const clearTuteeDiv = () => {
  tuteeDiv.innerHTML = "";
};

// Clears the div containing tutors
const clearTutorDiv = () => {
  tutorDiv.innerHTML = "";
};

const refresh = () => {
  displayTutees();
  displayTutors();
};

// Displays the tutees in the tutees array
const displayTutees = () => {
  clearTuteeDiv();
  for (const t of tutees) {
    const newTuteeDiv = document.createElement("div");
    const newTuteeDivName = document.createElement("div");
    newTuteeDivName.innerHTML =
      "<b>" + t.first + " " + t.last + ", " + t.grade + "th</b>";

    newTuteeDiv.appendChild(newTuteeDivName);
    tuteeDiv.appendChild(newTuteeDiv);

    newTuteeDiv.classList.add("tutee-div");
    newTuteeDivName.classList.add("tutee-div-name");

    t.div = newTuteeDiv;

    for (const p of pairings) {
      if (p.tuteeID == t.id) {
        const newPairingDiv = document.createElement("div");
        const newSubjectsDiv = document.createElement("div");
        const newTimesDiv = document.createElement("div");
        const newTutorDiv = document.createElement("div");

        const tutor = getTutorByID(p.tutorID);
        newTutorDiv.innerText = tutor.first + " " + tutor.last;

        newSubjectsDiv.innerHTML = "";
        newTimesDiv.innerHTML = "";

        for (const m in p.matches) {
          if (p.matches[m]) {
            if (days.includes(m.split(" ")[0])) {
              newTimesDiv.innerHTML += m + "<br>";
            } else {
              newSubjectsDiv.innerHTML += m + "<br>";
            }
          }
        }

        newPairingDiv.appendChild(newSubjectsDiv);
        newPairingDiv.appendChild(newTimesDiv);
        newPairingDiv.appendChild(newTutorDiv);
        newTuteeDiv.appendChild(newPairingDiv);

        newSubjectsDiv.classList.add("tutee-subjects-div");
        newTimesDiv.classList.add("tutee-times-div");
        newTutorDiv.classList.add("tutee-tutor-div");
        newPairingDiv.classList.add("tutee-pairing-div");
      }
    }
  }
};

// Displays the tutors in the tutors array
const displayTutors = () => {
  clearTutorDiv();
  for (const t of tutors) {
    const newTutorDiv = document.createElement("div");
    const newTutorDivName = document.createElement("div");
    newTutorDivName.innerHTML =
      "<b>" + t.first + " " + t.last + ", " + t.grade + "th</b>";

    newTutorDiv.appendChild(newTutorDivName);
    tutorDiv.appendChild(newTutorDiv);

    newTutorDiv.classList.add("tutor-div");
    newTutorDivName.classList.add("tutor-div-name");

    t.div = newTutorDiv;

    for (const p of pairings) {
      if (p.tutorID == t.id) {
        const newPairingDiv = document.createElement("div");
        const newSubjectsDiv = document.createElement("div");
        const newTimesDiv = document.createElement("div");
        const newTuteeDiv = document.createElement("div");

        const tutee = getTuteeByID(p.tuteeID);
        newTuteeDiv.innerText = tutee.first + " " + tutee.last;

        newSubjectsDiv.innerHTML = "";
        newTimesDiv.innerHTML = "";

        for (const m in p.matches) {
          if (p.matches[m]) {
            if (days.includes(m.split(" ")[0])) {
              newTimesDiv.innerHTML += m + "<br>";
            } else {
              newSubjectsDiv.innerHTML += m + "<br>";
            }
          }
        }

        newPairingDiv.appendChild(newSubjectsDiv);
        newPairingDiv.appendChild(newTimesDiv);
        newPairingDiv.appendChild(newTuteeDiv);
        newTutorDiv.appendChild(newPairingDiv);

        newSubjectsDiv.classList.add("tutor-subjects-div");
        newTimesDiv.classList.add("tutor-times-div");
        newTuteeDiv.classList.add("tutor-tutee-div");
        newPairingDiv.classList.add("tutor-pairing-div");
      }
    }
  }
};

const exportTuteeDataToSpreadsheet = (delimiter) => {
  let output =
    "Tutee,Tutor,Subjects,Times,Tutor,Subjects,Times,Tutor,Subjects,Times,Tutor,Subjects,Times,Tutor,Subjects,Times\n".replaceAll(
      ",",
      delimiter
    );
  for (const t of tutees) {
    output += t.first + " " + t.last + delimiter;
    for (const p of pairings) {
      if (p.tuteeID == t.id) {
        let subjectString = "";
        let subjectTime = "";
        let firstSubject = true,
          firstTime = true;
        for (const m in p.matches) {
          if (p.matches[m]) {
            if (isMatchTime(m)) {
              subjectTime += (firstTime ? "" : ",") + m;
              firstTime = false;
            } else {
              subjectString += (firstSubject ? "" : ",") + m;
              firstSubject = false;
            }
          }
        }
        output +=
          getTutorByID(p.tutorID).first +
          " " +
          getTutorByID(p.tutorID).last +
          delimiter;
        output +=
          '"' +
          subjectString +
          '"' +
          delimiter +
          '"' +
          subjectTime +
          '"' +
          delimiter;
      }
    }
    output += "\n";
  }
  return output;
};

const exportTutorDataToSpreadsheet = (delimiter) => {
  let output =
    "Tutor,Tutee,Subjects,Times,Tutee,Subjects,Times,Tutee,Subjects,Times,Tutee,Subjects,Times\n".replaceAll(
      ",",
      delimiter
    );
  for (const t of tutors) {
    output += t.first + " " + t.last + delimiter;
    for (const p of pairings) {
      if (p.tutorID == t.id) {
        let subjectString = "";
        let subjectTime = "";
        let firstSubject = true,
          firstTime = true;
        for (const m in p.matches) {
          if (p.matches[m]) {
            if (isMatchTime(m)) {
              subjectTime += (firstTime ? "" : ",") + m;
              firstTime = false;
            } else {
              subjectString += (firstSubject ? "" : ",") + m;
              firstSubject = false;
            }
          }
        }
        output +=
          getTuteeByID(p.tuteeID).first +
          " " +
          getTuteeByID(p.tuteeID).last +
          delimiter;
        output +=
          '"' +
          subjectString +
          '"' +
          delimiter +
          '"' +
          subjectTime +
          '"' +
          delimiter;
      }
    }
    output += "\n";
  }
  return output;
};

loadData();
