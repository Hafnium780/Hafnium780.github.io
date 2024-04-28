const subjectsList = [
  "Algebra 1",
  "Geometry",
  "Algebra 2",
  "Pre-Calculus",
  "Calculus",
  "Statistics",
  "CS",
  "Lit",
  "History",
  "Econ",
  "Biology",
  "Chemistry",
  "Physics",
  "Spanish",
  "Chinese",
  "Japanese",
  "French",
];

const timesList = [
  "Monday 6th period, 2:15 - 3:00",
  "Monday 7th period, 3:05 - 3:50",
  "Monday after school, 3:55 - 4:30",
  "Tuesday 7th period A, 2:20 - 3:05",
  "Tuesday 7th period B, 3:05 - 3:50",
  "Tuesday after school, 3:50 - 4:30",
  "Wednesday 6th period A, 1:35 - 2:20",
  "Wednesday 6th period B, 2:20 - 3:05",
  "Wednesday after school A, 3:05 - 3:50",
  "Wednesday after school B, 3:50 - 4:30",
  "Thursday 7th period A, 2:20 - 3:05",
  "Thursday 7th period B, 3:05 - 3:50",
  "Thursday after school, 3:50 - 4:30",
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
};

const generateRandomRows = () => {
  let ret = "";
  for (let i = 0; i < 50; i++) {
    ret += "4/12/2024 10:00:00\t";
    ret += Math.floor(Math.random() * 500000 + 100000) + "\t";
    ret +=
      String.fromCharCode("a".charCodeAt(0) + Math.floor(Math.random() * 26)) +
      String.fromCharCode("a".charCodeAt(0) + Math.floor(Math.random() * 26)) +
      "\t";
    ret +=
      String.fromCharCode("a".charCodeAt(0) + Math.floor(Math.random() * 26)) +
      String.fromCharCode("a".charCodeAt(0) + Math.floor(Math.random() * 26)) +
      "\t";
    ret += "asdf@student.fuhsd.org\t";
    ret += "first last\tasdf@gmail.com\t";
    ret += Math.floor(Math.random() * 4 + 9) + "th\t";
    const courses = Math.floor(Math.random() * 4 + 1);

    shuffle(subjectsList);
    for (let i = 0; i < courses; i++) {
      ret += subjectsList[i] + (i == courses - 1 ? "\t" : ", ");
    }
    for (let i = 0; i < courses; i++) {
      ret +=
        String.fromCharCode("A".charCodeAt(0) + Math.floor(Math.random() * 4)) +
        "\t";
    }
    for (let i = courses; i < 5; i++) {
      ret += "\t";
    }
    const times = Math.floor(Math.random() * 9 + 1);

    shuffle(timesList);
    for (let i = 0; i < times; i++) {
      ret += timesList[i] + (i == times - 1 ? "\n" : ", ");
    }
  }
  return ret;
};

// Get a tutor by their student ID
const getTutorByID = (id) => {
  for (const t of tutors) if (t.id === id) return t;
  return null;
};

// Get a tutee by their student ID
const getTuteeByID = (id) => {
  for (const t of tutees) if (t.id === id) return t;
  return null;
};

// Check if two tutee/tutor times coincide(ish)
const isValidTime = (tuteeTime, tutorTime) => {
  if (tuteeTime.day != tutorTime.day) return false;
  // if starting and ending times match by ~ 10 min, consider it valid
  if (
    Math.abs(tuteeTime.time.start - tutorTime.time.start) <= 10 &&
    Math.abs(tuteeTime.time.end - tutorTime.time.end) <= 10
  )
    return true;
  return false;
};

// Get all tutors that tutor an unmatched subject and have a coinciding time with a tutee
const getValidTutors = (id) => {
  const tutee = getTuteeByID(id);
  const subjectRet = new Set();
  for (const s of getUnmatchedSubjects(tutee)) {
    for (const t of tutors) {
      for (const ts of t.subjects) {
        if (ts == s) {
          subjectRet.add(t.id);
          break;
        }
      }
    }
  }

  const timeRet = new Set();
  for (const ti of getUnmatchedTimes(tutee)) {
    for (const t of tutors) {
      for (const tti of getTimesString(t)) {
        // if (isValidTime(ti, tti))
        if (ti == tti) timeRet.add(t.id);
      }
    }
  }
  return Array.from(subjectRet.intersection(timeRet));
};

// Get all tutors that tutor an given subject and have a coinciding time with a tutee
const getValidTutorsForSubject = (id, subject) => {
  const tutee = getTuteeByID(id);
  const subjectRet = new Set();
  for (const t of tutors) {
    for (const ts of t.subjects) {
      if (ts == subject) {
        subjectRet.add(t.id);
        break;
      }
    }
  }

  const timeRet = new Set();
  for (const ti of getUnmatchedTimes(tutee)) {
    for (const t of tutors) {
      for (const tti of getTimesString(t)) {
        // if (isValidTime(ti, tti))
        if (ti == tti) timeRet.add(t.id);
      }
    }
  }
  return Array.from(subjectRet.intersection(timeRet));
};

const getTimesString = (tut) => {
  const ret = [];
  for (const t of tut.times) {
    ret.push(
      t.day + " " + (t.time.start ? t.time.start + " - " + t.time.end : t.time)
    );
  }
  return ret;
};

const getUnmatchedSubjects = (tutee) => {
  const ret = [];
  for (const s of tutee.subjects) {
    let free = true;
    for (const p of pairings) {
      if (p.tuteeID == tutee.id) {
        if (p.matches[s]) {
          free = false;
        }
      }
    }
    if (free) ret.push(s);
  }
  return ret;
};

const getUnmatchedTimes = (tutee) => {
  const ret = [];
  for (const t of getTimesString(tutee)) {
    let free = true;
    for (const p of pairings) {
      if (p.tuteeID == tutee.id) {
        if (p.matches[t]) {
          free = false;
        }
      }
    }
    if (free) ret.push(t);
  }
  return ret;
};

const getUnmatchedTimesTutor = (tutor) => {
  const ret = [];
  for (const t of getTimesString(tutor)) {
    let free = true;
    for (const p of pairings) {
      if (p.tutorID == tutor.id) {
        if (p.matches[t]) {
          free = false;
        }
      }
    }
    if (free) ret.push(t);
  }
  return ret;
};

class Tutee {
  constructor(
    id,
    first,
    last,
    email,
    parent,
    parentEmail,
    grade,
    subjects,
    times,
    grades
  ) {
    this.id = id;
    this.first = first;
    this.last = last;
    this.email = email;
    this.parent = parent;
    this.parentEmail = parentEmail;
    if (grade.indexOf("th") != -1) grade = grade.replace("th", "");
    this.grade = grade;
    this.subjects = subjects;
    this.times = times;
    this.div = null;
    this.grades = grades;
  }
}

class Tutor {
  constructor(
    id,
    first,
    last,
    email,
    parent,
    parentEmail,
    grade,
    subjects,
    times
  ) {
    this.id = id;
    this.first = first;
    this.last = last;
    this.email = email;
    this.parent = parent;
    this.parentEmail = parentEmail;
    if (grade.indexOf("th") != -1) grade = grade.replace("th", "");
    this.grade = grade;
    this.subjects = subjects;
    this.times = times;
    this.div = null;
  }
}

const getMutualSubjectsPairing = (p) => {
  const tutee = getTuteeByID(p.tuteeID);
  const tutor = getTutorByID(p.tutorID);

  let tuteeSubjects = new Set();
  const unmatched = getUnmatchedSubjects(tutee);
  for (const s of tutee.subjects) {
    if (unmatched.includes(s) || p.matches[s]) tuteeSubjects.add(s);
  }

  let tutorSubjects = new Set();
  for (const s of tutor.subjects) {
    tutorSubjects.add(s);
  }

  return Array.from(tutorSubjects.intersection(tuteeSubjects)).sort();
};

const getMutualSubjectsID = (tuteeID, tutorID) => {
  const tutee = getTuteeByID(tuteeID);
  const tutor = getTutorByID(tutorID);

  let tuteeSubjects = new Set();
  const unmatched = getUnmatchedSubjects(tutee);
  for (const s of tutee.subjects) {
    if (unmatched.includes(s)) tuteeSubjects.add(s);
  }

  let tutorSubjects = new Set();
  for (const s of tutor.subjects) {
    tutorSubjects.add(s);
  }

  return Array.from(tutorSubjects.intersection(tuteeSubjects)).sort();
};

const getMutualTimesPairing = (p) => {
  const tutee = getTuteeByID(p.tuteeID);
  const tutor = getTutorByID(p.tutorID);

  let tuteeTimes = new Set();
  const unmatched = getUnmatchedTimes(tutee);
  for (const t of getTimesString(tutee)) {
    if (unmatched.includes(t) || p.matches[t]) tuteeTimes.add(t);
  }

  let tutorTimes = new Set();
  const unmatchedTutor = getUnmatchedTimesTutor(tutor);
  for (const t of getTimesString(tutor)) {
    if (unmatchedTutor.includes(t) || p.matches[t]) tutorTimes.add(t);
  }

  return Array.from(tutorTimes.intersection(tuteeTimes)).sort();
};

const getMutualTimesID = (tuteeID, tutorID) => {
  const tutee = getTuteeByID(tuteeID);
  const tutor = getTutorByID(tutorID);

  let tuteeTimes = new Set();
  const unmatched = getUnmatchedTimes(tutee);
  for (const t of getTimesString(tutee)) {
    if (unmatched.includes(t)) tuteeTimes.add(t);
  }

  let tutorTimes = new Set();
  const unmatchedTutor = getUnmatchedTimesTutor(tutor);
  for (const t of getTimesString(tutor)) {
    if (unmatchedTutor.includes(t)) tutorTimes.add(t);
  }

  return Array.from(tutorTimes.intersection(tuteeTimes)).sort();
};

class Pairing {
  constructor(tuteeID, tutorID) {
    this.tuteeID = tuteeID;
    this.tutorID = tutorID;
    this.matches = {};
    this.div = null;
  }
}

const afterSchoolStart = {
  Monday: 350,
  Tuesday: 350,
  Wednesday: 305,
  Thursday: 350,
  Friday: 305,
};

const afterSchoolEnd = {
  Monday: 440,
  Tuesday: 440,
  Wednesday: 440,
  Thursday: 440,
  Friday: 440,
};

// Is the given match a time? if not, it is a subject
const isMatchTime = (m) => {
  return days.includes(m.split(" ")[0]);
};

document.getElementById("fake-data").addEventListener("click", async () => {
  tutees = [];
  tutors = [];
  pairings = [];
  processTutees(parse(await (await fetch("./tutees.csv")).text()));
  processTutors(parse(await (await fetch("./tutors.csv")).text()));
});
