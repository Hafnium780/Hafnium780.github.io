const pairingsDiv = document.getElementById("pairings");
const pairButton = document.getElementById("pair");

let pairings = [];

// Clears the div containing pairings
const clearPairingsDiv = () => {
  pairingsDiv.innerHTML = "";
};

// Adds a pairing to the array
const addPairing = (tuteeID, tutorID) => {
  pairings.push(new Pairing(tuteeID, tutorID));
  refresh();
};

// Adds a pairing and subjects & times, does not refresh
const addPairingSubjectTime = (tuteeID, tutorID, subjects, times) => {
  const p = new Pairing(tuteeID, tutorID);
  for (s of subjects) p.matches[s] = true;
  for (t of times) p.matches[t] = true;
  pairings.push(p);
};

const getPairingsByTutee = (tuteeID) => {
  const ret = [];
  for (const p of pairings) {
    if (p.tuteeID == tuteeID) ret.push(p);
  }
  return ret;
};

const getPairingsByTutor = (tutorID) => {
  const ret = [];
  for (const p of pairings) {
    if (p.tutorID == tutorID) ret.push(p);
  }
  return ret;
};

// Get the number of times for which a tutor has been matched
const getTimesMatched = (tutorID) => {
  let cnt = 0;
  for (const p of getPairingsByTutor(tutorID)) {
    for (const k in p.matches) {
      if (isMatchTime(k) && p.matches[k]) cnt++;
    }
  }
  return cnt;
};

// Displays the pairings in the pairings array
const displayPairings = () => {
  clearPairingsDiv();
  for (const p of pairings) {
    const tutee = getTuteeByID(p.tuteeID);
    const tutor = getTutorByID(p.tutorID);

    const newPairingDiv = document.createElement("div");
    const newPairingDivTutee = document.createElement("div");
    const newPairingDivTutor = document.createElement("div");
    const newPairingDivDelete = document.createElement("div");
    const newPairingDivSubjects = document.createElement("div");
    const newPairingDivTimes = document.createElement("div");

    newPairingDivTutee.innerText =
      tutee.first + " " + tutee.last + ", " + tutee.grade + "th";
    newPairingDivTutor.innerText =
      tutor.first + " " + tutor.last + ", " + tutor.grade + "th";
    newPairingDivDelete.innerText = "delete";

    newPairingDiv.appendChild(newPairingDivTutee);
    newPairingDiv.appendChild(newPairingDivTutor);
    newPairingDiv.appendChild(newPairingDivDelete);
    newPairingDiv.appendChild(newPairingDivSubjects);
    newPairingDiv.appendChild(newPairingDivTimes);
    pairingsDiv.appendChild(newPairingDiv);

    newPairingDiv.classList.add("pairing-div");
    newPairingDivTutee.classList.add("pairing-div-tutee");
    newPairingDivTutor.classList.add("pairing-div-tutor");
    newPairingDivDelete.classList.add("pairing-div-delete");
    newPairingDivSubjects.classList.add("pairing-div-subjects");
    newPairingDivTimes.classList.add("pairing-div-times");

    p.div = newPairingDiv;

    const subjects = getMutualSubjectsPairing(p);

    for (const s of subjects) {
      const newSubjectsDivRow = document.createElement("div");
      const newSubjectsDivCheck = document.createElement("input");
      newSubjectsDivCheck.type = "checkbox";

      if (p.matches[s]) newSubjectsDivCheck.checked = p.matches[s];

      newSubjectsDivRow.innerText = s;

      newPairingDivSubjects.appendChild(newSubjectsDivRow);
      newSubjectsDivRow.prepend(newSubjectsDivCheck);

      newSubjectsDivRow.classList.add("pairing-div-subjects-row");

      newSubjectsDivCheck.addEventListener("change", () => {
        p.matches[s] = newSubjectsDivCheck.checked;

        refresh();
      });

      if (subjects.length == 1 && p.matches[s] == undefined) {
        newSubjectsDivCheck.click();
        return;
      }
    }

    const times = getMutualTimesPairing(p);

    for (const t of times) {
      const newTimesDivRow = document.createElement("div");
      const newTimesDivCheck = document.createElement("input");
      newTimesDivCheck.type = "checkbox";

      if (p.matches[t]) newTimesDivCheck.checked = p.matches[t];

      newTimesDivRow.innerText = t;

      newPairingDivTimes.appendChild(newTimesDivRow);
      newTimesDivRow.prepend(newTimesDivCheck);

      newTimesDivRow.classList.add("pairing-div-times-row");

      newTimesDivCheck.addEventListener("change", () => {
        p.matches[t] = newTimesDivCheck.checked;
        refresh();
      });

      if (times.length == 1 && p.matches[t] == undefined) {
        // newTimesDivCheck.click();
        // return;
      }
    }

    newPairingDivDelete.addEventListener("click", () => {
      pairings.splice(pairings.indexOf(p), 1);
      refresh();
    });
  }

  // Filter pairings
  if (selectedTuteeID) {
    for (const p of pairings) {
      if (p.tuteeID != selectedTuteeID) p.div.style = "display:none";
    }
  }
};

pairButton.addEventListener("click", () => {
  autoPair();
});
