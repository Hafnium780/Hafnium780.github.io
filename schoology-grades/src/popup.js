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
const copy = document.getElementById("copy");
const back = document.getElementById("back");
const domaininput = document.getElementById("domaininput");

let assignmentNames = {};
let showID;

copy.addEventListener("click", () => {
  copyText = "Assignment Name\tPoints\tMax points\n";
  for (const assignment of assignments) {
    copyText +=
      assignment.assignmentName +
      "\t" +
      assignment.rawGrade.pts +
      "\t" +
      assignment.rawGrade.max +
      "\n";
  }
  navigator.clipboard.writeText(copyText);
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
  chrome.storage.local.set({ domain: d });
};

const getDomain = () => {
  chrome.storage.local.get("domain", (d) => {
    if (d["domain"] !== undefined) {
      domain = d["domain"];
      domaininput.value = domain;
    }
    loadGrades();
  });
};

const getStoredAssignmentNames = () => {
  return new Promise((res) => {
    chrome.storage.local.get("assignmentNames", (a) => {
      assignmentNames = a["assignmentNames"] ?? {};
      res();
    });
  });
};

const storeAssignmentNames = () => {
  chrome.storage.local.set({ assignmentNames: assignmentNames });
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
  if (key !== "") chrome.storage.local.set({ key: key });
  if (signature !== "") chrome.storage.local.set({ signature: signature });
};

const getAuth = () => {
  return Promise.all([
    new Promise((res) => {
      chrome.storage.local.get("key", (k) => {
        key = k["key"];
        res();
      });
    }),
    new Promise((res) => {
      chrome.storage.local.get("signature", (s) => {
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

const getAssignmentTitles = (as, s, id, force = false) => {
  return new Promise((res, rej) => {
    if (as.length === 0) {
      res();
      return;
    }
    getAuth().then(async () => {
      for (const a of as) {
        if (id !== showID) break;
        if (assignmentNames[a.url] && !force) {
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
                showAssignments(s, id);
                tmp.remove();
              }
            })
            .catch((e) => {
              console.log(e);
            });
        }
      }
      storeAssignmentNames();
      showAssignments(s, id);
      res();
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
  copy.style.display = "none";
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

const showAssignments = (s, id) => {
  if (showID !== id) return;
  // loading = false;
  copy.style.display = "block";
  back.style.display = "block";
  list.innerHTML = "";
  const categories = [];
  if (!s.grading_category[s.grading_category.length - 1].created)
    s.grading_category.push({
      id: undefined,
      title: "Other",
      created: true,
    });
  let totalWeight = 0;
  for (const gc of s.grading_category) {
    if (gc.weight) totalWeight += gc.weight;
  }
  for (let i = 0; i < s.grading_category.length; i++) {
    const gc = s.grading_category[i];
    const weight =
      totalWeight === 100
        ? s.grading_category[i].weight
          ? s.grading_category[i].weight / totalWeight
          : 0
        : undefined;
    const div = document.createElement("div");
    const title = document.createElement("div");
    const titlediv = document.createElement("div");
    const wdiv = document.createElement("div");
    wdiv.id = "categoryweight";
    wdiv.innerText = weight ? "Weight: " + weight * 100 + "%" : "";
    title.id = "categorytitle";
    titlediv.id = "categorytitlediv";
    div.id = "categorydiv";
    div.style.zIndex = i.toString();
    title.innerText = gc.title;
    list.appendChild(div);
    div.appendChild(titlediv);
    titlediv.appendChild(wdiv);
    titlediv.appendChild(title);
    categories.push({
      id: gc.id,
      title: gc.title,
      div: div,
      weight: weight,
      totPts: 0,
      maxPts: 0,
    });
  }

  for (let i = 0; i < assignments.length; i++) {
    const a = assignments[i];
    const div = document.createElement("div");
    const grade = document.createElement("div");
    const reloadName = document.createElement("div");
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
    reloadName.id = "reloadname";
    reloadName.innerText = String.fromCodePoint(8635); // ↻
    grade.innerText = a.grade;
    assignmentName.innerText = a.assignmentName;
    const cat = categories.find((e, i) => {
      return e.id === a.category_id || i == categories.length - 1;
    });
    if (a.rawGrade.pts) {
      cat.totPts += a.rawGrade.pts;
      cat.maxPts += a.rawGrade.max;
    }
    cat.div.appendChild(div);
    reloadName.addEventListener("click", () => {
      assignmentName.innerText = "";
      getAssignmentTitles([a], s, id, true);
    });
    div.appendChild(reloadName);
    div.appendChild(assignmentName);
    div.appendChild(grade);
  }
  if (categories[0].weight !== undefined) {
    let totPer = 0;
    let outOf = 1;
    for (const gc of categories) {
      if (gc.maxPts === 0) outOf -= gc.weight;
    }
    for (const gc of categories) {
      if (gc.maxPts !== 0)
        totPer += ((gc.weight / outOf) * gc.totPts) / gc.maxPts;
    }
  } else {
    let totPts = 0,
      maxPts = 0;
    for (const gc of categories) {
      totPts += gc.totPts;
      maxPts += gc.maxPts;
    }
    console.log(totPts, maxPts, totPts / maxPts);
  }
  for (let i = 0; i < s.grading_category.length; i++) {
    const points = document.createElement("div");
    points.innerText =
      (Number.isInteger(categories[i].totPts)
        ? categories[i].totPts
        : categories[i].totPts.toFixed(2)) +
      "/" +
      (Number.isInteger(categories[i].maxPts)
        ? categories[i].maxPts
        : categories[i].maxPts.toFixed(2));
    points.id = "categorypoints";
    categories[i].div.firstElementChild.appendChild(points);
  }
};

const loadAssignments = async (s) => {
  if (loading) return;
  setTitle(s.courseName);
  await getStoredAssignmentNames();
  const thisID = Math.floor(Math.random() * 1000000);
  showID = thisID;
  loading = true;
  assignments = [];
  for (const p of s.period) {
    p.assignment.sort((a, b) => b.timestamp - a.timestamp);
    for (const a of p.assignment) {
      a.assignmentI = assignments.length;
      a.web_url = a.web_url?.replace("https://app", "https://" + domain);
      if (a.web_url && assignmentNames[a.web_url]) {
        assignments.push({
          grade: formatGrade(a),
          assignmentName: assignmentNames[a.web_url],
          url: a.web_url,
          category_id: a.category_id,
          assignmentI: a.assignmentI,
          rawGrade: { pts: a.grade, max: a.max_points },
        });
        a.skip = true;
      } else {
        assignments.push({
          grade: formatGrade(a),
          assignmentName: "---",
          category_id: a.category_id,
          assignmentI: a.assignmentI,
          rawGrade: { pts: a.grade, max: a.max_points },
        });
        a.skip = false;
      }
    }

    showAssignments(s, thisID);

    const requests = [];
    for (let i = 0; i < p.assignment.length; i += 45) {
      requests.push(p.assignment.slice(i, i + 45));
    }
    for (const r of requests) {
      let request = `<?xml version="1.0" encoding="utf-8" ?><requests>`;
      const actualI = [];
      for (let i = 0; i < r.length; i++) {
        if (r[i].skip != true) {
          actualI.push(i);
          request += `<request>` + r[i].location + `</request>`;
        }
      }
      request += `</requests>`;
      if (actualI.length === 0) continue;

      const rereq = [];
      await multiGet(request)
        .then((v) => {
          for (let i = 0; i < v.response.length; i++) {
            let ai = actualI[i];
            const res = v.response[i];
            const url = r[ai].web_url;
            if (res.response_code === 403) {
              rereq.push({ assignmentI: r[ai].assignmentI, url: url });
            } else {
              assignments[r[ai].assignmentI].assignmentName = res.body.title;
              assignmentNames[url] = res.body.title;
              assignments[r[ai].assignmentI].url = url;
              showAssignments(s, thisID);
            }
          }
          storeAssignmentNames();
        })
        .catch((e) => console.log(e));
      await getAssignmentTitles(rereq, s, thisID);
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

const demoGrades = () => {
  showID = -1;
  grades = [
    { courseName: "Math", grade: "99.99%", courseI: 0 },
    { courseName: "Science", grade: "99.98%", courseI: 1 },
    { courseName: "History", grade: "99.97%", courseI: 2 },
    { courseName: "English", grade: "99.96%", courseI: 3 },
  ];
  showGrades(-1);
};

const demoAssignments = () => {
  showID = -1;
  assignments = [
    { assignmentName: "Syllabus", grade: "2/10" },
    { assignmentName: "Test", grade: "20/20" },
    { assignmentName: "Free Points", grade: "100/100" },
  ];
  setTitle("A Class");
  showAssignments(undefined, -1);
};
