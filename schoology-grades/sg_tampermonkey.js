// ==UserScript==
// @name         Schoology Grades
// @version      0.1
// @description  Grabs Grades from Schoology
// @author       Hafnium780
// @match        https://api.schoology.com/v1/sg
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    document.title = "sg";
    window.stop();
    document.body = document.createElement("body");
    // Make new page
    document.body.innerHTML = `
<style>
* { margin: 0px; padding: 0px; font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif; align-items: center; text-align: center; }
.nosel { -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: -moz-none; -o-user-select: none; user-select: none; }
input { outline: none !important }

html { overflow: hidden; }
body { background-color: #777777; padding: 0px; }

#bar { background-color: #AAAAAA; padding: 6px; height: 65px; top: 0px; left: 0px; right: 0px; border-bottom: 4px solid black; }

#title { font-size: 25px }

#domain { margin-top: 3px; }
#domain-input { width: 50px; height: 8px; padding-bottom: -2px; font-size: 13px; border-radius: 2px; height: 20px; }
#domain-text { font-size: medium; }

#secrets { display: flex; position: absolute; height: 50px; width: 450px; transition: left ease 100ms; top: 14px; left: 0px; }
#secrets-input { background-color: #DDAAAA; width: 435px; padding: 4px; height: 42px; }
#key { font-size: medium; padding-left: 43px; text-align: left; }
#key-input { width: 310px; background-color: #CC9999; border: 1px solid black; font-family: monospace; }
#signature { font-size: medium; padding-left: 3px; text-align: left; }
#signature-input { width: 310px; background-color: #CC9999; border: 1px solid black; font-family: monospace; }

#secrets-toggle { width: 15px; background-color: #888888; height: 46px; padding: 2px; cursor: pointer; font-size: 12px; line-height: 1.25; }

#grades { display: flex; align-items: start; }

#course-grades { overflow: auto; width: 50%; height: calc(100vh - 65px); border-right: 2px solid black; background-color: #777777 }

.course-grade-element { font-size: 14px; display: flex; height: 25px; cursor: pointer; }
.course-grade-name { width: 80%; text-align: left; padding-left: 10px; }
.course-grade-grade { width: 20%; font-family: monospace; text-align: right; }

.course-grade-element:nth-child(odd) { background-color: #BBBBBB; }
.course-grade-element:nth-child(even) { background-color: #CCCCCC; }

#assignment-grades { overflow: auto; width: 50%; height: calc(100vh - 65px); border-left: 2px solid black; background-color: #777777 }

.assignment-grade-element { font-size: 14px; display: flex; height: 25px; }
.assignment-grade-name { width: 80%; text-align: left; padding-left: 10px; }
a.assignment-grade-name { color: blue; }
.assignment-grade-grade { width: 20%; font-family: monospace; text-align: right; }

.assignment-grade-element:nth-child(even) { background-color: #BBBBBB; }
.assignment-grade-element:nth-child(odd) { background-color: #CCCCCC; }

</style>
<div id="bar" class="nosel">
  <div id="title"></div>
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
  <div id="secrets-toggle">K\nE\nY</div>
</div>
<div id="grades">
  <div id="course-grades" class="nosel">
  </div>
  <div id="assignment-grades">
  </div>
</div>
    `
    let isChrome = !!chrome;
    let protocol = isChrome ? "https" : "http";

    let grades, courses, gCount, assignments, assignmentNames;

    let loadingAssignment = false;
    let assignmentShowID = undefined;

    let title = document.getElementById("title");
    const setTitle = (t) => {
        title.innerText = t;
    };

    // Get DOM elements

    let domain_input = document.getElementById("domain-input");
    let secrets = document.getElementById("secrets");
    let key_input = document.getElementById("key-input");
    let signature_input = document.getElementById("signature-input");
    let secrets_toggle = document.getElementById("secrets-toggle");
    let course_grades = document.getElementById("course-grades");
    let assignment_grades = document.getElementById("assignment-grades");

    // Before loading grades

    const authError = () => {
        setTitle("<-- Enter API Key and Signature");
    };

    const start = () => {
        if (!key || !signature) {
            authError();
            return;
        }
        setTitle("Loading Grades...");
        loadGrades();
    }

    // Load and save input values

    let key = GM_getValue("sg_key");
    let signature = GM_getValue("sg_signature");
    let domain = GM_getValue("sg_domain");

    if (domain) domain_input.value = domain;

    domain_input.addEventListener("input", () => {
        GM_setValue("sg_domain", domain_input.value);
        domain = domain_input.value;
    });

    if (key) key_input.value = key;
    if (signature) signature_input.value = signature;

    if (key && signature) secrets.style.left = "-435px";

    key_input.addEventListener("input", () => {
        GM_setValue("sg_key", key_input.value);
        key = key_input.value;
        start();
    });

    signature_input.addEventListener("input", () => {
        GM_setValue("sg_signature", signature_input.value);
        signature = signature_input.value;
        start();
    });

    secrets_toggle.addEventListener("click", () => {
        if (secrets.style.left === "-435px") secrets.style.left = "0px";
        else secrets.style.left = "-435px";
    });

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

    const schoologyHeaders = (fileType) => {
        return {
            Accept: fileType,
            Host: "api.schoology.com",
            Authorization: authHeader(),
            "Content-Type": "text/xml",
        };
    };

    // API helper functions

    const getContent = (a) => {
        return new Promise((res, rej) => {
            fetch(
                a.indexOf(protocol + "://api.schoology.com") === -1
                ? protocol + "://api.schoology.com/v1/" + a
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

    const multiGet = (b) => {
        return new Promise((res, rej) => {
            fetch(protocol + "://api.schoology.com/v1/multiget", {
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

    const roundGrade = (g) => {
        return (g?.toFixed(2) ?? "N/A") + "%";
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

    const createAssignmentGrade = (name, grade, url=undefined) => {
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
    }

    const displayAssignments = () => {
        assignment_grades.innerHTML = "";
        for (const assignment of assignments) {
            createAssignmentGrade(assignment.assignmentName, assignment.grade, assignment.url);
        }
    }

    const loadGrades = async () => {
        grades = [];
        courses = [];
        getContent("app-user-info")
            .then(async (v) => {
            const apiID = v.api_uid;
            getContent("users/" + apiID + "/grades").then(async (v) => {
                gCount = v.section.length;
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
                }).catch((e) => console.log(e));

                setTitle("Select a Course");
            });
        }).catch((e) => {
            if (e === 401) {
                authError();
            } else console.log(e);
        });
    };

    const loadAssignments = async (s) => {
        setTitle("Loading " + s.courseName + "...");
        loadingAssignment = true;
        const thisID = Math.floor(Math.random() * 1000000);
        assignmentShowID = thisID;
        assignments = [];
        assignmentNames = [];
        for (const p of s.period) {
            p.assignment.sort((a, b) => b.timestamp - a.timestamp);
            for (const a of p.assignment) {
                a.assignmentI = assignments.length;
                a.web_url = a.web_url?.replace("https://app", "https://" + domain);
                assignments.push({
                    grade: formatGrade(a),
                    assignmentName: "---",
                    category_id: a.category_id,
                    assignmentI: a.assignmentI,
                    rawGrade: { pts: a.grade, max: a.max_points },
                });
                a.skip = false;
            }

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
                await multiGet(request).then((v) => {
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
                        }
                    }
                }).catch((e) => console.log(e));

                displayAssignments();
            }
        }
        loadingAssignment = false;
        setTitle(s.courseName);
    };

    start();

    // setTimeout(() => {
        // document.write("reqas");
       //  loadAssignments(course[grades[1].courseI]);
    // }, 7000);

    if (!isChrome) completion();
})();
