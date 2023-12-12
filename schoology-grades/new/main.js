const checkInterval = setInterval(() => {
  if (document.getElementById("wrapper") == null) return;
  clearInterval(checkInterval);
  start();
}, 100);

const start = async () => {
  let key, signature;
  const getContent = async (a) => {
    const ret = await chrome.runtime.sendMessage({
      type: "getContent",
      url: a,
    });
    if (ret.error === 401) {
      authError();
    }
    return ret;
  };

  const getHTML = async (a) => {
    const ret = await chrome.runtime.sendMessage({
      type: "getHTML",
      url: a,
    });
    if (ret.error === 401) {
      authError();
    }
    return ret;
  };

  const multiGet = async (b) => {
    const ret = await chrome.runtime.sendMessage({
      type: "multiGet",
      data: b,
    });
    if (ret.error === 401) {
      authError();
    }
    return ret;
  };

  const updateKeyInfo = async () => {
    ({ sg_key: key, sg_signature: signature } = await chrome.storage.local.get([
      "sg_key",
      "sg_signature",
    ]));
    await chrome.runtime.sendMessage({
      type: "setLogin",
      key: key,
      signature: signature,
    });
  };

  await updateKeyInfo();
  document.title = "sg";
  window.stop();
  document.body = document.createElement("body");
  // Make new page
  document.body.innerHTML = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
<style>
* { margin: 0px; padding: 0px; font-family: Inter; align-items: center; text-align: center; }
.nosel { -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: -moz-none; -o-user-select: none; user-select: none; }
input { outline: none !important }

::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-track { background: #1E1F21; }
::-webkit-scrollbar-thumb { background: #363639; border-radius: 5px; }

html { overflow: hidden; }
body { padding: 0px; }

#bar { background-color: #363639; padding: 6px; height: 65px; top: 0px; left: 0px; right: 0px; border-bottom: 2px solid #424244; }

a#title { color: #F5F4F3 !important; font-size: 25px; margin: 6px 0px; font-weight: 700; text-decoration: none; }

#domain { margin-top: 3px; }
#domain-input { width: 50px; height: 12px; padding-bottom: -2px; font-size: 13px; border: none; border-radius: 2px; background-color: #161619; color: #F5F4F3; }
#domain-text { font-size: medium; color: #F5F4F3; }

#secrets { display: flex; position: absolute; height: 50px; width: 450px; transition: left ease 200ms; bottom: 0px; left: 0px; border: none; }
#secrets-input { background-color: #363639; width: 435px; padding: 4px; height: 42px; border: none; border-top: 2px solid #424244; }
#key { font-size: medium; padding-left: 47px; text-align: left; color: #F5F4F3; }
#key-input { width: 310px; height: 14px; background-color: #161619; border: 1px solid black; font-family: monospace; font-size: small; border: none; color: #F5F4F3; }
#signature { font-size: medium; padding-left: 3px; text-align: left; color: #F5F4F3; }
#signature-input { width: 310px; height: 14px; background-color: #161619; border: 1px solid black; font-family: monospace; font-size: small; border: none; color: #F5F4F3; }

#secrets-toggle { writing-mode: vertical-rl; text-orientation: mixed; color: #F5F4F3; width: 15px; background-color: #F9485F; height: 46px; padding: 2px; cursor: pointer; font-size: 12px; line-height: 1.25; border-top-right-radius: 10px; border-bottom-right-radius: 10px; }

#grades { display: flex; align-items: start; }

#course-grades { overflow: auto; width: 450px; height: calc(100vh - 65px); background-color: #2E2E30; border-right: 2px solid #424244; }

.course-grade-element:first-child { margin-top: 10px; }
.course-grade-element { font-size: 14px; display: flex; height: 40px; cursor: pointer; filter: brightness(100%); margin: 8px; background-color: #2E2E30; border-radius: 10px; }
.course-grade-name { width: 80%; text-align: left; padding-left: 10px; color: #F5F4F3; }
.course-grade-grade { width: 14%; text-align: center; padding: 5px; background-color: #E9384F; color: #F5F4F3; border-radius: 10px; margin-left: 16px; }


.course-grade-element:hover { filter: brightness(100%); background-color: #5A5A5C; transition: filter ease 300ms, background-color ease 300ms; }

#assignment-div { width: calc(100vw - 450px); height: calc(100vh - 65px); background-color: #1E1F21; }
#assignment-grades { overflow: auto; width: 100%; height: calc(100vh - 180px); background-color: #1E1F21; }
#calculated-grade-title { font-size: large; color: #F5F4F3; margin: 6px 0px; }
#calculated-grade { font-size: x-large; color: #F5F4F3; padding: 5px; background-color: #E9384F; border-radius: 10px; width: min-content; margin: 6px auto; }
#calculated-grade-error { font-size: small; color: #F5F4F3; margin: 6px 0px; }

.categorytitlediv { border-top: 2px solid #424244; position: sticky; background-color: #2E2E30;
                    top: 0px; display: flex; flex-direction: row; margin-bottom: 3px; padding: 5px; color: #F5F4F3; z-index: 100; }
.categorypoints { font-size: small; flex: 0 0; text-align: center; padding: 5px; background-color: #E9384F; border-radius: 10px; min-width: 100px; margin-left: 10px; }
.categorypercent { font-size: small; flex: 0 0; text-align: center; padding: 5px; background-color: #C1B4AE; color: #1E1F21; border-radius: 10px; min-width: 60px; }
.categorytitle { font-size: large; font-weight: bold; flex: 1 1; text-align: center; position: absolute; left: 0px; right: 0px; pointer-events: none; }
.categoryweight { font-size: small; padding: 5px; text-align: center; background-color: #C1B4AE; color: #1E1F21; border-radius: 10px; flex: 0 0; min-width: 100px; margin-left: 10px; margin-right: calc(100% - 423px); }
.categoryweightmethod { cursor: pointer; font-size: small; padding: 5px; text-align: center; background-color: #E9384F; border-radius: 10px; flex: 0 0; min-width: 100px; transition: background-color ease 200ms; }
.categoryweightmethod:hover { background-color: #F9586F; }
.categoryweight:empty { opacity: 0; }
.categorydiv:last-child { padding-bottom: 15px; }

.assignment-grade-element { padding: 6px; padding-left: 10px; display: flex; min-width: 0; flex-shrink: 0; flex-grow: 0; align-items: center; margin-right: 2px; border-top: 2px solid #424244; }
.assignment-grade-element:first-child { border: none; }
.assignment-grade-input { width: 55px; background-color: #931022; font-size: 13px; color: #F5F4F3; border: none; padding: 4px 3px 4px 4px; height: 18px; flex: 0 0 55px; text-align: right; border-radius: 5px; }
.assignment-grade-input.assignment-grade-input:focus { background-color: #531012 }
.assignment-grade-input:hover { background-color: #731012 }
::placeholder { color: #F5F4F3; font-size: 13px; }
.assignment-grade-max { flex: 0 0 52px; text-align: left; color: #F5F4F3; font-size: 13px; }
.assignment-grade-grade { display: flex; align-items: center; justify-content: end; font-size: small; text-align: right; flex-grow: 0; flex-shrink: 0; vertical-align: middle; text-align: center; padding-right: 10px; padding: 5px; background-color: #931022; border-radius: 10px; width: 100px; height: 16px; overflow: hidden; }
a.assignment-grade-name { color: #F5F4F3 !important; }
.assignment-grade-name { color: #F5F4F3; text-align: left; flex-grow: 1; margin-right: 3px; margin-left: 3px; font-size: medium; font-weight: normal; }
.assignment-grade-reset { width: 16px; height: 16px; background-color: #E9384F; flex: 0 0 16px; margin-right: 10px; cursor: pointer; scale: 1; border-radius: 7px; color: #F5F4F3 }
.assignment-grade-reset:hover { scale: 1.1; transition: scale ease 100ms; }
.assignment-grade-reload { border-radius: 8px; width: 16px; height: 16px; font-size: 12px; background-color: #767679; flex: 0 0 16px; left: 2px; text-align: center; color: #F5F4F3; margin: 0px 2px; cursor: pointer; scale: 1; padding: auto; }
.assignment-grade-reload:hover { scale: 1.1; transition: scale ease 100ms; }

</style>
<div id="bar" class="nosel">
  <a id="title"></a>
  <div id="domain">
    <span id="domain-text">Domain: </span>
    <input type="text" id="domain-input"></input>
    <span id="domain-text">.schoology.com</span>
  </div>
</div>
<div id="secrets" class="nosel">
  <div id="secrets-input">
    <div id="key">
      Key:
      <input id="key-input"></input>
    </div>
    <div id="signature">
      Signature:
      <input id="signature-input"></input>
    </div>
  </div>
  <div id="secrets-toggle">API</div>
</div>
<div id="grades">
  <div id="course-grades" class="nosel">
  </div>
  <div id="assignment-div">
    <div id="assignment-grades">

    </div>
  </div>
</div>
    `;

  let grades,
    courses,
    assignments,
    assignmentNames,
    assignmentFactors,
    categoryTypes;

  let assignmentShowID = undefined;

  const title = document.getElementById("title");
  const setTitle = (t, href = undefined) => {
    title.innerText = t;
    if (href) {
      title.style.cursor = "pointer";
      title.setAttribute("href", href);
    } else {
      title.style.cursor = "default";
    }
  };

  // Get DOM elements

  const domain_input = document.getElementById("domain-input");
  const secrets = document.getElementById("secrets");
  const key_input = document.getElementById("key-input");
  const signature_input = document.getElementById("signature-input");
  const secrets_toggle = document.getElementById("secrets-toggle");
  const course_grades = document.getElementById("course-grades");
  const assignment_div = document.getElementById("assignment-div");
  const assignment_grades = document.getElementById("assignment-grades");

  // Before loading grades

  const authError = () => {
    setTitle(
      "Visit " + (domain ?? "domain") + ".schoology.com/api to get the API key",
      "https://" + (domain ?? "domain") + ".schoology.com/api"
    );
  };

  const actualStart = () => {
    if (!key || !signature) {
      authError();
      return;
    }
    setTitle("Loading Grades...");
    loadGrades();
  };

  // Load and save input values

  const storeAssignmentDetails = async () => {
    await chrome.storage.local.set({
      sg_assignment_names: assignmentNames,
      sg_assignment_factors: assignmentFactors,
    });
  };

  const storeCategoryDetails = async () => {
    await chrome.storage.local.set({ sg_category_types: categoryTypes });
  };

  let domain = (await chrome.storage.local.get(["sg_domain"])).sg_domain;

  if (domain) domain_input.value = domain;
  else {
    domain = new URL(window.location.href).host.split(".")[0];
    domain_input.value = domain;
    await chrome.storage.local.set({ sg_domain: domain });
  }

  domain_input.addEventListener("input", async () => {
    domain = domain_input.value;
    await chrome.storage.local.set({ sg_domain: domain_input.value });
  });

  if (key) key_input.value = key;
  if (signature) signature_input.value = signature;

  if (key && signature) secrets.style.left = "-435px";

  key_input.addEventListener("input", async () => {
    key = key_input.value;
    await chrome.storage.local.set({ sg_key: key_input.value });
    await updateKeyInfo();
    start();
  });

  signature_input.addEventListener("input", async () => {
    signature = signature_input.value;
    await chrome.storage.local.set({ sg_signature: signature_input.value });
    await updateKeyInfo();
    start();
  });

  secrets_toggle.addEventListener("click", () => {
    if (secrets.style.left === "-435px") secrets.style.left = "0px";
    else secrets.style.left = "-435px";
  });

  const roundGrade = (g) => {
    if (g && !isNaN(g)) return g.toFixed(2) + "%";
    return "N/A%";
  };

  const formatGrade = (a) => {
    return (a.grade ?? "---") + "/" + (a.max_points ?? "---");
  };

  // Custom display elements

  const createCourseGrade = (name, grade, courseI) => {
    let mainDiv = document.createElement("div");
    mainDiv.classList.add("course-grade-element");
    let nameDiv = document.createElement("div");
    nameDiv.innerText = name;
    nameDiv.classList.add("course-grade-name");
    let gradeDiv = document.createElement("div");
    gradeDiv.innerText = grade;
    gradeDiv.classList.add("course-grade-grade");
    mainDiv.appendChild(gradeDiv);
    mainDiv.appendChild(nameDiv);
    course_grades.appendChild(mainDiv);

    mainDiv.addEventListener("click", () => {
      loadAssignments(courses[courseI]);
    });
  };

  const createAssignmentGrade = (name, grade, url = undefined) => {
    let mainDiv = document.createElement("div");
    mainDiv.classList.add("assignment-grade-element");
    let nameDiv = document.createElement(url ? "a" : "div");
    nameDiv.innerText = name;
    nameDiv.classList.add("assignment-grade-name");
    if (url) nameDiv.href = url;
    let gradeDiv = document.createElement("div");
    gradeDiv.innerText = grade;
    gradeDiv.classList.add("assignment-grade-grade");
    mainDiv.appendChild(gradeDiv);
    mainDiv.appendChild(nameDiv);
    assignment_grades.appendChild(mainDiv);
  };

  // Main loading and display

  const displayGrades = () => {
    course_grades.innerHTML = "";
    for (const grade of grades) {
      createCourseGrade(grade.courseName, grade.grade, grade.courseI);
    }
  };

  const displayAssignments = async (s, id) => {
    if (assignmentShowID !== id) return;

    try {
      categoryTypes =
        (await chrome.storage.local.get(["sg_category_types"]))
          .sg_category_types ?? {};
    } catch (e) {}
    assignment_grades.innerHTML = "";
    let calculated_grade_title =
      document.getElementById("calculated-grade-title") ??
      document.createElement("div");
    let calculated_grade =
      document.getElementById("calculated-grade") ??
      document.createElement("div");
    let calculated_grade_error =
      document.getElementById("calculated-grade-error") ??
      document.createElement("div");
    calculated_grade_title.id = "calculated-grade-title";
    calculated_grade.id = "calculated-grade";
    calculated_grade_error.id = "calculated-grade-error";
    calculated_grade_title.innerText = "Calculated Grade";
    calculated_grade_error.innerText =
      "Category grades not matching with Schoology? Try switching the weighting method (Percentage or Points) for individual categories.";
    assignment_div.insertBefore(calculated_grade_title, assignment_grades);
    assignment_div.insertBefore(calculated_grade, assignment_grades);
    assignment_div.insertBefore(calculated_grade_error, assignment_grades);
    const categories = [];
    if (!s.grading_category[s.grading_category.length - 1].created) {
      s.grading_category.push({
        id: undefined,
        title: "Other",
        created: true,
      });
    }
    let totalWeight = 0;
    for (const gc of s.grading_category) {
      if (gc.weight) totalWeight += gc.weight;
    }

    for (let i = 0; i < s.grading_category.length; i++) {
      const gc = s.grading_category[i];
      let weight = undefined;
      if (totalWeight === 100) {
        if (s.grading_category[i].weight)
          weight = s.grading_category[i].weight / totalWeight;
        else weight = 0;
      }
      const div = document.createElement("div");
      const title = document.createElement("div");
      const titlediv = document.createElement("div");
      const wdiv = document.createElement("div");
      const methoddiv = document.createElement("div");
      wdiv.classList.add("categoryweight");
      wdiv.innerText = weight
        ? "Weight: " + +parseFloat(weight * 100).toFixed(2) + "%"
        : "";
      methoddiv.classList.add("categoryweightmethod");
      methoddiv.classList.add("nosel");
      methoddiv.innerText =
        (categoryTypes[gc.id] ?? 2) == 1 ? "Percentage" : "Points";

      let id = gc.id;
      methoddiv.addEventListener("click", () => {
        categoryTypes[id] = (categoryTypes[gc.id] ?? 2) == 1 ? 2 : 1;
        methoddiv.innerText =
          categoryTypes[gc.id] == 1 ? "Percentage" : "Points";
        storeCategoryDetails();
        updateGrades(s, categories);
      });

      title.classList.add("categorytitle");
      titlediv.classList.add("categorytitlediv");
      div.classList.add("categorydiv");
      div.style.zIndex = i.toString();
      title.innerText = gc.title;
      assignment_grades.appendChild(div);
      div.appendChild(titlediv);
      titlediv.appendChild(methoddiv);
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
      const gradeMax = document.createElement("div");
      const gradeInput = document.createElement("input");
      const resetGrade = document.createElement("div");
      const reloadName = document.createElement("div");
      let assignmentName;
      if (a.url) {
        assignmentName = document.createElement("a");
        assignmentName.href = a.url;
        assignmentName.target = "_blank";
      } else {
        assignmentName = document.createElement("div");
      }
      div.classList.add("assignment-grade-element");
      grade.classList.add("assignment-grade-grade");
      gradeMax.classList.add("assignment-grade-max");
      gradeInput.classList.add("assignment-grade-input");
      resetGrade.classList.add("assignment-grade-reset");
      assignmentName.classList.add("assignment-grade-name");
      reloadName.classList.add("assignment-grade-reload");

      reloadName.innerText = String.fromCodePoint(8635); // ↻
      gradeMax.innerText = "/ " + (a.rawGrade.max ?? "---");
      gradeInput.value = a.rawGrade.pts ?? "";
      gradeInput.setAttribute("placeholder", "---");
      resetGrade.innerText = String.fromCodePoint(8635); // ↻

      if (a.assignmentName == undefined || a.assignmentName == "le>")
        assignmentName.innerText = "unknown";
      else assignmentName.innerText = a.assignmentName;
      const cat = categories.find((e, i) => {
        return e.id === a.category_id || i == categories.length - 1;
      });

      cat.div.appendChild(div);
      reloadName.addEventListener("click", () => {
        assignmentName.innerText = "";
        getAssignmentTitles([a], s, id, true);
      });

      gradeInput.addEventListener("input", () => {
        updateGrades(s, categories);
      });

      resetGrade.addEventListener("click", () => {
        gradeInput.value = a.rawGrade.pts ?? "";
        updateGrades(s, categories);
      });

      div.appendChild(reloadName);
      div.appendChild(assignmentName);
      div.appendChild(resetGrade);
      div.appendChild(grade);
      grade.appendChild(gradeInput);
      grade.appendChild(gradeMax);
      a.gradeInput = gradeInput;
      a.resetGrade = resetGrade;
    }
    updateGrades(s, categories);
    //        for (const assignment of assignments) {
    //            createAssignmentGrade(assignment.assignmentName, assignment.grade, assignment.url);
    //        }
  };

  const updateGrades = (s, categories, reset = false) => {
    for (const c of categories) {
      c.totPts = 0;
      c.maxPts = 0;
      c.calculation_type = categoryTypes[c.id] ?? 2;
    }

    for (let i = 0; i < assignments.length; i++) {
      const a = assignments[i];
      const cat = categories.find((e, i) => {
        return e.id === a.category_id || i == categories.length - 1;
      });
      const pts = reset ? a.rawGrade.pts : parseFloat(a.gradeInput.value);
      if (reset) a.gradeInput.value = a.rawGrade.pts ?? "";
      if (!isNaN(pts) && pts !== null) {
        if (cat.calculation_type == 2) {
          cat.totPts += pts * a.factor;
          cat.maxPts += a.rawGrade.max * a.factor;
        } else {
          cat.totPts += (pts / a.rawGrade.max) * a.factor;
          cat.maxPts += a.factor;
        }
      }
      if (
        (isNaN(pts) && a.rawGrade.pts !== null) ||
        (!isNaN(pts) && pts !== a.rawGrade.pts)
      ) {
        a.resetGrade.style.display = "block";
      } else {
        a.resetGrade.style.display = "none";
      }
    }

    let calcGrade;
    if (categories[0].weight !== undefined) {
      let totPer = 0;
      let outOf = 1;
      for (const gc of categories) {
        if (gc.maxPts === 0) outOf -= gc.weight;
      }
      for (const gc of categories) {
        if (gc.maxPts !== 0) {
          totPer += ((gc.weight / outOf) * gc.totPts) / gc.maxPts;
        }
      }
      calcGrade = totPer;
    } else {
      let totPts = 0,
        maxPts = 0;
      for (const gc of categories) {
        totPts += gc.totPts;
        maxPts += gc.maxPts;
      }
      calcGrade = totPts / maxPts;
    }
    for (let i = 0; i < s.grading_category.length; i++) {
      const points =
        categories[i].div.firstElementChild.getElementsByClassName(
          "categorypoints"
        )[0] ?? document.createElement("div");
      const percent =
        categories[i].div.firstElementChild.getElementsByClassName(
          "categorypercent"
        )[0] ?? document.createElement("div");
      points.innerText =
        (Number.isInteger(categories[i].totPts)
          ? categories[i].totPts
          : categories[i].totPts.toFixed(2)) +
        "/" +
        (Number.isInteger(categories[i].maxPts)
          ? categories[i].maxPts
          : categories[i].maxPts.toFixed(2));
      percent.innerText = roundGrade(
        (categories[i].totPts / categories[i].maxPts) * 100
      );
      points.classList.add("categorypoints");
      percent.classList.add("categorypercent");
      categories[i].div.firstElementChild.appendChild(percent);
      categories[i].div.firstElementChild.appendChild(points);
    }
    document.getElementById("calculated-grade").innerText = roundGrade(
      calcGrade * 100
    );
  };

  const loadGrades = async () => {
    grades = [];
    courses = [];

    getContent("app-user-info")
      .then(async (v) => {
        const apiID = v.api_uid;
        getContent("users/" + apiID + "/grades").then(async (v) => {
          for (const s of v.section) {
            courses.push(s);
          }

          let request = `<?xml version="1.0" encoding="utf-8" ?><requests>`;
          for (const s of v.section) {
            request += "<request>/v1/sections/" + s.section_id + "</request>";
          }
          request += "</requests>";

          await multiGet(request)
            .then((r) => {
              for (let i = 0; i < r.response.length; i++) {
                const res = r.response[i];
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
              displayGrades();
            })
            .catch((e) => console.log(e));

          setTitle("Select a Course");
        });
      })
      .catch((e) => {
        if (e === 401) {
          authError();
        } else console.log(e);
      });
  };

  const loadAssignments = async (s) => {
    setTitle("Loading " + s.courseName + "...");
    const thisID = Math.floor(Math.random() * 1000000);
    assignmentShowID = thisID;
    assignments = [];
    try {
      assignmentNames =
        (await chrome.storage.local.get(["sg_assignment_names"]))
          .sg_assignment_names ?? {};
      assignmentFactors =
        (await chrome.storage.local.get(["sg_assignment_factors"]))
          .sg_assignment_factors ?? {};
    } catch (e) {}

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
            factor: assignmentFactors[a.web_url] ?? 1,
            rawGrade: { pts: a.grade, max: a.max_points },
          });
          a.skip = true;
        } else {
          assignments.push({
            grade: formatGrade(a),
            assignmentName: "---",
            category_id: a.category_id,
            assignmentI: a.assignmentI,
            url: a.web_url,
            factor: assignmentFactors[a.web_url] ?? 1,
            rawGrade: { pts: a.grade, max: a.max_points },
          });
          a.skip = false;
        }
      }

      await displayAssignments(s, thisID);

      const requests = [];
      for (let i = 0; i < p.assignment.length; i += 45) {
        requests.push(p.assignment.slice(i, i + 45));
      }
      for (const r of requests) {
        if (thisID !== assignmentShowID) break;
        let request = `<?xml version="1.0" encoding="utf-8" ?><requests>`;
        const actualI = [];
        for (let i = 0; i < r.length; i++) {
          if (!r[i].skip) {
            actualI.push(i);
            request += `<request>` + r[i].location + `</request>`;
          }
        }
        request += `</requests>`;
        if (actualI.length === 0) continue;

        const rereq = [];
        await multiGet(request)
          .then((v) => {
            if (thisID !== assignmentShowID) return;
            for (let i = 0; i < v.response.length; i++) {
              let ai = actualI[i];
              const res = v.response[i];
              const url = r[ai].web_url;
              if (res.response_code === 403) {
                rereq.push({ assignmentI: r[ai].assignmentI, url: url });
              } else {
                assignments[r[ai].assignmentI].assignmentName = res.body.title;
                if (res.body.factor) {
                  assignments[r[ai].assignmentI].factor = parseFloat(
                    res.body.factor
                  );
                  assignmentFactors[url] = parseFloat(res.body.factor);
                }
                assignments[r[ai].assignmentI].url = url;
                assignmentNames[url] = res.body.title;
              }
            }
          })
          .catch((e) => console.log(e));

        displayAssignments(s, thisID);
        storeAssignmentDetails();
        await getAssignmentTitles(rereq, s, thisID);
      }
    }
    if (thisID == assignmentShowID) {
      setTitle(s.courseName);
    }
  };

  const getAssignmentTitles = (as, s, id, force = false) => {
    return new Promise(async (res) => {
      if (as.length === 0) {
        res();
        return;
      }
      for (const a of as) {
        if (id !== assignmentShowID) break;
        if (assignmentNames[a.url] && !force) {
          assignments[a.assignmentI].assignmentName = assignmentNames[a.url];
          assignments[a.assignmentI].url = a.url;
        } else {
          await getHTML(a.url)
            .then((v) => {
              if (id !== assignmentShowID) return;
              if (v.error) {
                assignments[a.assignmentI].assignmentName = undefined;
                assignmentNames[a.url] = undefined;
                assignments[a.assignmentI].url = a.url;
                storeAssignmentDetails();
                displayAssignments(s, id);
              }
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
                storeAssignmentDetails();
                displayAssignments(s, id);
                tmp.remove();
              }
            })
            .catch(() => {});
        }
      }
      storeAssignmentDetails();
      if (id === assignmentShowID) displayAssignments(s, id);
      res();
    });
  };

  actualStart();
};

/*
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

  // temporary things
  const resetButton = document.createElement("div");
  resetButton.innerText = "RESET";
  resetButton.classList.add("reset-button");
  resetButton.addEventListener("click", reset);
  document.body.append(resetButton);

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
*/
