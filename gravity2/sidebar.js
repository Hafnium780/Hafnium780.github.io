let sidebarHeight = 120;

const sidebar = document.getElementById("sidebar");

const buildsidebar = document.getElementById("buildsidebar");
const optionssidebar = document.getElementById("optionssidebar");
const sidebars = [buildsidebar, optionssidebar];
let currentSidebar = 1;

const buildsidebartab = document.getElementById("buildsidebartab");
const optionssidebartab = document.getElementById("optionssidebartab");
const sidebartabs = [buildsidebartab, optionssidebartab];

const massslider = document.getElementById("massslider");
const massinfo = document.getElementById("massinfo");
const createplanetbutton = document.getElementById("createplanetbutton");

const optionspath = document.getElementById("optionspath");
const optionsenergy = document.getElementById("optionsenergy");

massslider.addEventListener("input", updateMass);
createplanetbutton.addEventListener("click", createPlanet);
let mass;
updateMass();
function updateMass() {
	mass = parseFloat(massslider.value);
	massinfo.innerText = "Mass: " + mass;
}

function createPlanet() {
	updateMass();
	mouseState = "createPlanet";
}

for (let i = 0; i < sidebars.length; i++) {
	sidebars[i].classList.add("hidden");
	sidebartabs[i].addEventListener("click", () => {
		if (currentSidebar === i) {
			closeSidebar();
		} else {
			openSidebar(i);
		}
	});
	sidebartabs[i].style.left = 5 + 60 * i + "px";
}

function closeSidebar() {
	if (currentSidebar !== -1) {
		sidebartabs[currentSidebar].classList.remove("selected");
		sidebars[currentSidebar].classList.add("hidden");
	}
	currentSidebar = -1;
	for (const sidebartab of sidebartabs) {
		sidebartab.style.bottom = "-3px";
	}
	updateHeights();
}

function openSidebar(i) {
	if (currentSidebar !== -1) {
		sidebartabs[currentSidebar].classList.remove("selected");
		sidebars[currentSidebar].classList.add("hidden");
	}
	currentSidebar = i;
	sidebartabs[currentSidebar].classList.add("selected");
	sidebars[currentSidebar].classList.remove("hidden");
	for (const sidebartab of sidebartabs) {
		sidebartab.style.bottom = sidebarHeight - 3 + "px";
	}
	updateHeights();
}

// options
let showPath = false;
let calculateEscapeEnergy = false;

optionspath.addEventListener("click", () => {
	showPath = !showPath;
	if (showPath) {
		optionspath.getElementsByClassName("optionscheckbox")[0].innerText = "(X)";
		for (const planet of map.planets) {
			planet.path = [];
		}
	} else {
		optionspath.getElementsByClassName("optionscheckbox")[0].innerText = "( )";
	}
});

optionsenergy.addEventListener("click", () => {
	calculateEscapeEnergy = !calculateEscapeEnergy;
	if (calculateEscapeEnergy) {
		optionsenergy.getElementsByClassName("optionscheckbox")[0].innerText =
			"(X)";
	} else {
		optionsenergy.getElementsByClassName("optionscheckbox")[0].innerText =
			"( )";
	}
});
