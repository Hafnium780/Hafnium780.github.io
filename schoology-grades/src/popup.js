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
    signature +
    `%26"`
  );
};

const list = document.getElementById("list");
const title = document.getElementById("title");
const reset = document.getElementById("reset");
const back = document.getElementById("back");
const domaininput = document.getElementById("domaininput");

let assignmentNames = {};
let showID;

reset.addEventListener("click", () => {
  chrome.storage.sync.set({ assignmentNames: {} });
  assignmentNames = {};
});

back.addEventListener("click", () => {
  const thisID = Math.floor(Math.random() * 1000000);
  showID = thisID;
  showGrades(showID);
});

domaininput.addEventListener("change", () => {
  setDomain(domaininput.value);
  loadGrades();
});

const setDomain = (d) => {
  domain = d;
  chrome.storage.sync.set({ domain: d });
};

const getDomain = () => {
  chrome.storage.sync.get("domain", (d) => {
    if (d["domain"] !== undefined) {
      domain = d["domain"];
      domaininput.value = domain;
    }
    loadGrades();
  });
};

const getStoredAssignmentNames = () => {
  return new Promise((res) => {
    chrome.storage.sync.get("assignmentNames", (a) => {
      assignmentNames = a["assignmentNames"] ?? {};
      res();
    });
  });
};

const storeAssignmentNames = () => {
  chrome.storage.sync.set({ assignmentNames: assignmentNames });
};

const setTitle = (s) => {
  title.innerText = s;
};

// keyInput.addEventListener("input", () => {
//   setAuth(keyInput.value, "");
// });

// signatureInput.addEventListener("input", () => {
//   setAuth("", signatureInput.value);
// });

const schoologyHeaders = (fileType) => {
  return {
    Accept: fileType,
    Host: "api.schoology.com",
    Authorization: authHeader(),
    "Content-Type": "text/xml",
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

const unauthError = () => {
  document.getElementById("error").style.display = "block";
  document.getElementById("errorlink").href = document.getElementById(
    "errorlink"
  ).innerText = "https://" + (domain ?? "__domain__") + ".schoology.com/api";
};

const getContent = (a) => {
  return new Promise((res, rej) => {
    fetch(
      a.indexOf("https://api.schoology.com") === -1
        ? "https://api.schoology.com/v1/" + a
        : a,
      {
        method: "GET",
        headers: schoologyHeaders("application/json"),
      }
    )
      .then((v) => {
        if (!v.ok) rej(v.status);
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

const getHTML = (a) => {
  return new Promise((res, rej) => {
    fetch(a, {
      method: "GET",
      headers: schoologyHeaders("text/html"),
    })
      .then((v) => {
        v.text()
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

const multiGet = (b) => {
  return new Promise((res, rej) => {
    fetch("https://api.schoology.com/v1/multiget", {
      method: "POST",
      headers: schoologyHeaders("application/json"),
      body: b,
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

const sleep = async (t) => {
  return new Promise((res) => {
    setTimeout(res, t);
  });
};

const getAssignmentTitles = (as, id) => {
  if (as.length === 0) return;
  getAuth().then(() => {
    getStoredAssignmentNames().then(async () => {
      for (const a of as) {
        if (id !== showID) break;
        if (assignmentNames[a.url]) {
          assignments[a.assignmentI].assignmentName = assignmentNames[a.url];
          assignments[a.assignmentI].url = a.url;
        } else {
          await getHTML(a.url)
            .then((v) => {
              let i = v.search(/<title>/);
              let j = v.search(/<\/title>/);
              if (i === -1) {
                assignments[a.assignmentI].url = a.url;
              } else {
                const tmp = document.createElement("textarea");
                tmp.innerHTML = v.substring(i + 7, j - 12);

                assignments[a.assignmentI].assignmentName = tmp.value;
                assignmentNames[a.url] = tmp.value;
                assignments[a.assignmentI].url = a.url;
                storeAssignmentNames();
                showAssignments(id);
                tmp.remove();
              }
            })
            .catch((e) => {
              console.log(e);
            });
        }
      }
      storeAssignmentNames();
      showAssignments(id);
    });
  });
};

const roundGrade = (g) => {
  return (g?.toFixed(2) ?? "N/A") + "%";
};

const formatGrade = (a) => {
  return (a.grade ?? "---") + "/" + (a.max_points ?? "---");
};

let gCount = 0,
  aCount = 0;
let grades = [];
let courses = [];
let assignments = [];
let loading = false;
let domain = undefined;

const showGrades = (id) => {
  if (showID !== id) return;
  loading = false;
  reset.style.display = "none";
  back.style.display = "none";
  setTitle("Course Grades");
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
    courseName.id = "name";
    courseName.classList.add("course");
    grade.innerText = g.grade;
    courseName.innerText = g.courseName;
    list.appendChild(div);
    div.addEventListener("click", () => {
      loadAssignments(courses[g.courseI]);
    });
    div.appendChild(courseName);
    div.appendChild(grade);
  }
};

const showAssignments = (id) => {
  if (showID !== id) return;
  // loading = false;
  reset.style.display = "block";
  back.style.display = "block";
  list.innerHTML = "";
  for (const a of assignments) {
    const div = document.createElement("div");
    const grade = document.createElement("div");
    let assignmentName;
    if (a.url) {
      assignmentName = document.createElement("a");
      assignmentName.href = a.url;
      assignmentName.target = "_blank";
    } else {
      assignmentName = document.createElement("div");
    }
    div.id = "div";
    grade.id = "grade";
    assignmentName.id = "name";
    grade.innerText = a.grade;
    assignmentName.innerText = a.assignmentName;
    list.appendChild(div);
    div.appendChild(assignmentName);
    div.appendChild(grade);
  }
};

const loadAssignments = async (s) => {
  if (loading) return;
  setTitle(s.courseName);
  const thisID = Math.floor(Math.random() * 1000000);
  showID = thisID;
  // let lastdate = Date.now();
  loading = true;
  assignments = [];
  for (const p of s.period) {
    p.assignment.sort((a, b) => b.timestamp - a.timestamp);

    for (const a of p.assignment) {
      a.assignmentI = assignments.length;
      assignments.push({
        grade: formatGrade(a),
        assignmentName: "---",
      });
    }
    showAssignments(thisID);

    const requests = [];
    for (let i = 0; i < p.assignment.length; i += 45) {
      requests.push(p.assignment.slice(i, i + 45));
    }
    for (const r of requests) {
      let request = `<?xml version="1.0" encoding="utf-8" ?><requests>`;
      for (const a of r) request += `<request>` + a.location + `</request>`;
      request += `</requests>`;

      const rereq = [];
      await multiGet(request)
        .then((v) => {
          for (let i = 0; i < v.response.length; i++) {
            const res = v.response[i];
            const url = r[i].web_url?.replace(
              "https://app",
              "https://" + domain
            );
            if (res.response_code === 403) {
              rereq.push({ assignmentI: r[i].assignmentI, url: url });
            } else {
              assignments[r[i].assignmentI].assignmentName = res.body.title;
              assignments[r[i].assignmentI].url = url;
              showAssignments(thisID);
            }
          }
        })
        .catch((e) => console.log(e));
      getAssignmentTitles(rereq, thisID);
    }
  }
  loading = false;
};

const loadGrades = async () => {
  if (loading) return;
  setTitle("Loading Grades...");
  if (domain === undefined) {
    setTitle("Enter Domain Name:");
    return;
  }
  const thisID = Math.floor(Math.random() * 1000000);
  showID = thisID;
  loading = true;
  grades = [];
  courses = [];
  getAuth().then(async () => {
    getContent("app-user-info")
      .then(async (v) => {
        const apiID = v.api_uid;
        getContent("users/" + apiID + "/grades").then(async (v) => {
          gCount = v.section.length;
          for (const s of v.section) {
            courses.push(s);
          }

          let request = `<?xml version="1.0" encoding="utf-8" ?><requests>`;
          for (const s of v.section)
            request +=
              `<request>` + "/v1/sections/" + s.section_id + `</request>`;
          request += `</requests>`;

          await multiGet(request)
            .then((r) => {
              for (let i = 0; i < r.response.length; i++) {
                const res = r.response[i];
                if (res.response_code === 401) {
                  unauthError();
                  return;
                }
                if (res.response_code === 403) continue;
                else {
                  courses[i].courseName =
                    res.body.course_title + " " + res.body.section_title;
                  grades.push({
                    courseName:
                      res.body.course_title + " " + res.body.section_title,
                    grade: roundGrade(v.section[i].final_grade[0].grade),
                    courseI: i,
                  });
                }
              }
              showGrades(thisID);
            })
            .catch((e) => console.log(e));
        });
      })
      .catch((e) => {
        if (e === 401) {
          unauthError();
        } else console.log(e);
      });
  });
};

getDomain();
