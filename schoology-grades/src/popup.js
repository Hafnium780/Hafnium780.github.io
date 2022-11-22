let key = undefined;
let signature = undefined;

const authHeader = () => {
  return (
    `OAuth realm="Schoology API",oauth_consumer_key="` +
    key +
    `",oauth_token="",oauth_nonce="` +
    Math.floor(Math.random() * 100000000) +
    `",oauth_timestamp="` +
    Math.floor(Date.now() / 1000) +
    `",oauth_signature_method="PLAINTEXT",oauth_version="1.0",oauth_signature="` +
    signature + // super secure storage!!!!
    `%26"`
  );
};

const keyInput = document.getElementById("keyInput");
const signatureInput = document.getElementById("signatureInput");
const list = document.getElementById("list");

keyInput.addEventListener("input", () => {
  setAuth(keyInput.value, "");
});

signatureInput.addEventListener("input", () => {
  setAuth("", signatureInput.value);
});

const schoologyHeaders = () => {
  return {
    Accept: "application/json",
    Host: "api.schoology.com",
    "Content-Type": "application/json",
    Authorization: authHeader(),
  };
};

const setAuth = (key = "", signature = "") => {
  if (key !== "") chrome.storage.sync.set({ key: key });
  if (signature !== "") chrome.storage.sync.set({ signature: signature });
};

const getAuth = () => {
  return Promise.all([
    new Promise((res) => {
      chrome.storage.sync.get("key", (k) => {
        key = k["key"];
        res();
      });
    }),
    new Promise((res) => {
      chrome.storage.sync.get("signature", (s) => {
        signature = s["signature"];
        res();
      });
    }),
  ]);
};

const getContent = (a) => {
  return new Promise((res, rej) => {
    fetch("https://api.schoology.com/v1/" + a, {
      method: "GET",
      headers: schoologyHeaders(),
    })
      .then((v) => {
        v.json()
          .then((vv) => res(vv))
          .catch((e) => {
            rej(e);
          });
      })
      .catch((e) => {
        rej(e);
      });
  });
};

const roundGrade = (g) => {
  return (g?.toFixed(2) ?? "N/A") + "%";
};

let gCount = 0;
let grades = [];

const showGrades = () => {
  list.innerHTML = "";
  grades.sort((a, b) => {
    return a.courseName > b.courseName ? 1 : -1;
  });
  for (const g of grades) {
    const div = document.createElement("div");
    const grade = document.createElement("div");
    const courseName = document.createElement("div");
    div.id = "div";
    grade.id = "grade";
    courseName.id = "courseName";
    grade.innerText = g.grade;
    courseName.innerText = g.courseName;
    list.appendChild(div);
    div.appendChild(courseName);
    div.appendChild(grade);
  }
};

const loadGrades = () => {
  grades = [];
  getAuth().then(() => {
    getContent("app-user-info")
      .then((v) => {
        const apiID = v.api_uid;
        getContent("users/" + apiID + "/grades").then((v) => {
          gCount = v.section.length;
          for (const s of v.section) {
            getContent("sections/" + s.section_id)
              .then((v) => {
                grades.push({
                  courseName: v.course_title + " " + v.section_title,
                  grade: roundGrade(s.final_grade[0].grade),
                });
                gCount--;
                if (gCount === 0) showGrades();
              })
              .catch((e) => {
                console.log(e);
                gCount--;
                if (gCount === 0) showGrades();
              });
          }
        });
      })
      .catch((e) => {
        console.log(e);
      });
  });
};

document.getElementById("loadGrades").addEventListener("click", loadGrades);

loadGrades();
