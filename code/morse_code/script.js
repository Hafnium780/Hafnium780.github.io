ref = {
	".-": "a",
	"-...": "b",
	"-.-.": "c",
	"-..": "d",
	".": "e",
	"..-.": "f",
	"--.": "g",
	"....": "h",
	"..": "i",
	".---": "j",
	"-.-": "k",
	".-..": "l",
	"--": "m",
	"-.": "n",
	"---": "o",
	".--.": "p",
	"--.-": "q",
	".-.": "r",
	"...": "s",
	"-": "t",
	"..-": "u",
	"...-": "v",
	".--": "w",
	"-..-": "x",
	"-.--": "y",
	"--..": "z",
	".----": "1",
	"..---": "2",
	"...--": "3",
	"....-": "4",
	".....": "5",
	"-....": "6",
	"--...": "7",
	"---..": "8",
	"----.": "9",
	"-----": "0",
};

revref = {};

for (m in ref) {
	revref[ref[m]] = m;
}

ti = 0;
mouseDown = false;
cur_morse = "";
const light = document.getElementById("light");
const guess = document.getElementById("guess");

function morse_down() {
	mouseDown = true;
	ti = Date.now();
}

function morse_up() {
	len = Date.now() - ti;
	ti = Date.now();
	if (len > 120) cur_morse += "-";
	else cur_morse += ".";
	mouseDown = false;
}

document.getElementById("morse").addEventListener("mousedown", morse_down);
document.getElementById("morse").addEventListener("mouseup", morse_up);
document.addEventListener("keydown", (e) => {
	if (!e.repeat && e.key === " ") morse_down();
});
document.addEventListener("keyup", (e) => {
	if (e.key === " ") morse_up();
});

setInterval(() => {
	if (cur_morse.length > 0 && !mouseDown && Date.now() - ti > 240) {
		console.log(cur_morse);
		console.log(ref[cur_morse]);
		if (ref[cur_morse]) {
			document.getElementById("input").value += ref[cur_morse];
		}
		cur_morse = "";
	}
}, 1000 / 60);

const sleep = (t) =>
	new Promise((res) => {
		setTimeout(res, t);
	});

async function flash(s) {
	// console.log(s);
	await sleep(1000);
	for (c of s) {
		if (c === " ") await sleep(500);
		else
			for (m of revref[c]) {
				light.style.backgroundColor = "black";
				if (m === ".") await sleep(80);
				else await sleep(400);
				light.style.backgroundColor = "white";
				await sleep(300);
			}
		await sleep(600);
	}
}

wordlist = [];
currentWord = "";
fetch(
	"https://raw.githubusercontent.com/redbo/scrabble/master/dictionary.txt"
).then((v) =>
	v.text().then((vv) => {
		for (word of vv.split("\n")) {
			if (word.length > 2 && word.length < 6) wordlist.push(word);
		}
		currentWord =
			wordlist[Math.floor(Math.random() * wordlist.length)].toLowerCase();
		flash(currentWord);
	})
);

guess.addEventListener("keydown", (e) => {
	if (!e.repeat && e.key === "Enter") {
		if (guess.value.toLowerCase() === currentWord) console.log("y");
		else console.log("n");
	}
});
