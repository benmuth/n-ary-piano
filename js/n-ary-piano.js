"use strict";

// const { start } = require("tone");

var playSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" width="30" >
 <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
  </svg>`;
var stopSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" width="30">
<path fill-rule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clip-rule="evenodd" />
</svg>`;

// there can be multiple "keyboards"
// each keyboard has data: a radix, current count

// digits for different bases:
// 2 - 10
// 3 - 6
// 4 - 5
// 5 - 4
// 6 - 4
// 7 - 3
// 8 - 3
// 9 - 3
// 10 - 3

// the default values for a new piano of a given base
const defaults = {
  2: {
    padding: "0000000000",
    notes: ["D4", "E4", "F4", "G4", "A5", "C5", "D5", "E5", "F5", "G5"],
    durations: [1.7, 1.5, 1.3, 1.2, 0.9, 0.7, 0.6, 0.5, 0.5, 0.4],
  },

  3: {
    padding: "000000",
    notes: ["D4", "E4", "F4", "G4", "A5", "C5"],
    durations: [1.7, 1.5, 1.3, 1.2, 0.9, 0.7],
  },

  4: {
    padding: "00000",
    notes: ["D4", "E4", "F4", "G4", "A5"],
    durations: [1.7, 1.5, 1.3, 1.2, 0.9],
  },

  5: {
    padding: "0000",
    notes: ["D4", "E4", "F4", "G4"],
    durations: [1.7, 1.5, 1.3, 1.2],
  },

  6: {
    padding: "0000",
    notes: ["D4", "E4", "F4", "G4"],
    durations: [1.7, 1.5, 1.3, 1.2],
  },

  7: {
    padding: "000",
    notes: ["D4", "E4", "F4"],
    durations: [1.7, 1.5, 1.3],
  },

  8: {
    padding: "000",
    notes: ["D4", "E4", "F4"],
    durations: [1.7, 1.5, 1.3],
  },

  9: {
    padding: "000",
    notes: ["D4", "E4", "F4"],
    durations: [1.7, 1.5, 1.3],
  },

  10: {
    padding: "000",
    notes: ["D4", "E4", "F4"],
    durations: [1.7, 1.5, 1.3],
  },
};

// holds all the data for a piano
class Piano {
  constructor(base) {
    base = base ?? 2;
    if (base === "") {
      base = 2;
    }
    console.log("new piano with base: ", base);
    this.base = base;
    this.maxDigit = (base - 1).toString();
    this.notes = defaults[base].notes.slice();
    this.durations = defaults[base].durations.slice();
    this.max = Math.pow(base, defaults[base].padding.length) - 1;
    this.prevArr = [];
    this.padding = defaults[base].padding;
  }
}

let uiEls = {
  pianos: document.getElementsByClassName("piano"),
  playButton: document.getElementById("play"),

  // stopButton: document.getElementById("stop"),
  addPianoButton: document.getElementById("add-piano"),

  // new pianos are added after the previous piano
  prevPiano: document.getElementById("anchor"),
  activePiano: document.getElementsByClassName("active piano")[0],

  // the note input element that is changed by clicking the keyboard
  selectedNoteInput: document.getElementsByClassName("selected")[0],

  keyboard: document.getElementById("piano-keyboard"),

  noteInputArea: document.getElementById("notes"),
};

var played = false;
var playing = false;

// set up interactions for keyboard and note UI
function bindUI() {
  let synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      partials: [0, 2, 3, 4],
    },
  }).toDestination();
  // clicking on a key
  uiEls.keyboard.addEventListener("click", (ev) => {
    if (ev.target.id === "piano-keyboard") {
      return;
    }

    let clickedKey = ev.target.dataset.pianoKey; // the note value of the clicked key
    synth.triggerAttackRelease(clickedKey, 0.4);
    let selectedNoteIndex = +uiEls.selectedNoteInput.dataset.index; // the index of the selected note input (0-9)
    let nextIndex = getNextNoteIndex(selectedNoteIndex);

    uiEls.selectedNoteInput.value = clickedKey;
    uiEls.activePiano.obj.notes[selectedNoteIndex] = clickedKey;

    let nextNoteInput = document.querySelectorAll(
      `[data-index='${nextIndex}']`
    )[0];

    selectNoteInput(nextNoteInput);
    updateKeyboardUI();
  });

  // clicking on a note input
  uiEls.noteInputArea.addEventListener("click", (ev) => {
    selectNoteInput(ev.target);
  });

  // clicking on the start button
  uiEls.playButton.addEventListener("click", () => {
    // let ctx = new AudioContext();
    // let toneCtx = new Tone.Context(ctx);
    // let synth = new Tone.PolySynth(8, Tone.Synth, {
    //   oscillator: {
    //     partials: [0, 2, 3, 4],
    //   },
    // }).toMaster();
    if (!played) {
      Tone.Transport.start();
      uiEls.playButton.innerHTML = stopSVG;
      playing = true;
      played = true;
      return;
    }

    Tone.Transport.toggle();

    if (playing) {
      // Tone.Transport.cancel();
      playing = false;
      uiEls.playButton.innerHTML = playSVG;
    } else {
      // toneCtx.resume();
      playing = true;
      uiEls.playButton.innerHTML = stopSVG;
    }
  });

  // clicking on the add piano button
  uiEls.addPianoButton.addEventListener("click", () => {
    let base = prompt("Enter base: ", [2, 3, 4, 5, 6, 7, 8, 9, 10]);
    addPiano(base);
  });

  let initButton = document.getElementById("init");
  initButton.addEventListener("click", () => {
    let synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        partials: [0, 2, 3, 4],
      },
    }).toDestination();
    uiEls.pianos = document.getElementsByClassName("piano");
    console.log("pianos: ", uiEls.pianos);
    Tone.Transport.bpm.value = 80;
    //play a note every eighth note starting from the first measure
    Tone.Transport.scheduleRepeat(
      (time) => updateAndPlayPianos(time, synth),
      "16n",
      "1m"
    );
    // synth = Tone.start();
    Tone.start();
  });
}

function getNextNoteIndex(currentNoteIndex) {
  let nextIndex = currentNoteIndex + 1;
  if (nextIndex >= uiEls.activePiano.obj.notes.length) {
    // cycle notes
    nextIndex = nextIndex % uiEls.activePiano.obj.notes.length;
  }
  return nextIndex;
}

// highlight the given note element
function selectNoteInput(noteElement) {
  if (noteElement.tagName === "INPUT") {
    uiEls.selectedNoteInput.classList.remove("selected");
    noteElement.classList.add("selected");
    uiEls.selectedNoteInput = noteElement;
    setPianosInURL();
    updateKeyboardUI();
  }
}

// adds a new piano with the given base to the page
function addPiano(base) {
  // remove initial dummy piano
  document.getElementById("anchor").classList.remove("piano");

  let piano = new Piano(base);

  // create new piano div
  const pianoDiv = document.createElement("div");
  pianoDiv.classList.add("piano");

  pianoDiv.setAttribute("id", `p-${uiEls.pianos.length}`);
  pianoDiv.setAttribute("data-val", "0");
  pianoDiv.obj = piano;

  // add select button to piano
  const selectButton = document.createElement("button");
  // selectButton.textContent = "Select";
  selectButton.classList.add("select-button");
  selectButton.addEventListener("click", (e) => {
    makeActivePiano(e.currentTarget.parentElement);
  });
  pianoDiv.appendChild(selectButton);

  // add piano numbers to piano
  const pianoNumbers = document.createElement("span");
  pianoNumbers.textContent = piano.padding;
  pianoNumbers.classList.add("piano-numbers");
  pianoDiv.appendChild(pianoNumbers);

  // add base change input to piano
  const baseChangeInput = document.createElement("input");
  baseChangeInput.setAttribute("type", "number");
  baseChangeInput.setAttribute("id", `base-${uiEls.pianos.length}`);
  baseChangeInput.setAttribute("name", "select-base");
  baseChangeInput.setAttribute("min", "2");
  baseChangeInput.setAttribute("max", "10");
  baseChangeInput.classList.add("base-input");
  baseChangeInput.addEventListener("input", (ev) => {
    console.log(ev.target.value);
    changeBase(ev.target.parentElement, ev.target.value);
  });
  pianoDiv.appendChild(baseChangeInput);

  console.log("prev: ", uiEls.prevPiano);
  console.log("to add: ", pianoDiv);
  uiEls.prevPiano.after(pianoDiv);
  uiEls.prevPiano = pianoDiv;

  uiEls.pianos = document.getElementsByClassName("piano");

  makeActivePiano(pianoDiv);

  setPianosInURL();
  return pianoDiv;
}

function changeBase(piano, base) {
  piano.dataset.val = 0;
  piano.obj = new Piano(base);

  // console.log(piano);
  // console.log(piano.firstChild.nodeValue);

  let pianoNumbers;
  for (const child of piano.children) {
    if (child.classList.contains("piano-numbers")) {
      pianoNumbers = child;
    }
  }
  console.log("new piano numbers: ", piano.obj.padding);
  pianoNumbers.textContent = piano.obj.padding;
  updateKeyboardUI();
  setPianosInURL();
}

function makeActivePiano(selectedPiano) {
  if (uiEls.activePiano === selectedPiano) {
    updateKeyboardUI();
    return;
  }
  selectedPiano.classList.add("active");
  uiEls.activePiano.classList.remove("active");
  uiEls.activePiano = selectedPiano;
  updateKeyboardUI();
}

function updateKeyboardUI() {
  let activePianoNotes = uiEls.activePiano.obj.notes;

  const noteContainer = document.getElementById("notes");
  let notes = noteContainer.children;

  // change display of notes to match active piano
  for (let i = 0; i < notes.length; i++) {
    if (i < activePianoNotes.length) {
      notes[i].toggleAttribute("hidden", false);
      notes[i].value = activePianoNotes[i];
    } else {
      notes[i].toggleAttribute("hidden", true);
    }
  }

  // highlight selected notes on keyboard
  let keys = document.getElementById("piano-keyboard").children;
  let keysToHighlight = [];
  for (let i = 0; i < keys.length; i++) {
    // remove playing notes from previous piano
    keys[i].classList.remove("playing");
    // pick selected keys
    keys[i].classList.remove("highlight");
    keys[i].classList.remove("selected");
    for (let j = 0; j < activePianoNotes.length; j++) {
      if (notes[j].value === keys[i].dataset.pianoKey) {
        keysToHighlight.push(keys[i]);
        if (notes[j].classList.contains("selected")) {
          keys[i].classList.add("selected");
        }
      }
    }
  }
  for (let i = 0; i < keysToHighlight.length; i++) {
    keysToHighlight[i].classList.add("highlight");
  }
}

function updateAndPlayPianos(time, synth) {
  for (let piano of uiEls.pianos) {
    let display = makePianoDisplayString(piano);
    let displayArr = display.split("");

    for (let i = 0; i < displayArr.length; i++) {
      let shouldPlayNote =
        displayArr[i] === piano.obj.maxDigit &&
        piano.obj.prevArr[i] !== piano.obj.maxDigit;
      if (shouldPlayNote) {
        synth.triggerAttackRelease(
          piano.obj.notes[i],
          piano.obj.durations[i],
          time
        );
        for (let key of uiEls.keyboard.children) {
          if (key.dataset.pianoKey == uiEls.activePiano.obj.notes[i]) {
            key.classList.add("playing");
          } else {
            key.classList.remove("playing");
          }
        }
      }
    }

    // update piano data
    for (const child of piano.children) {
      if (child.classList.contains("piano-numbers")) {
        child.textContent = display;
      }
    }
    // piano.firstChild.textContent = display;
    piano.obj.prevArr = displayArr;
    piano.dataset.val++;
    if (piano.dataset.val == piano.obj.max) {
      piano.dataset.val == 0;
    }
  }
}

function makePianoDisplayString(piano) {
  let count = piano.dataset.val;
  let countString = (+count).toString(piano.obj.base);
  let zeroPadding = piano.obj.padding.substring(
    0,
    piano.obj.padding.length - countString.length
  );
  return zeroPadding + countString;
}

function setPianosInURL() {
  let URLString = encodePianos();
  history.replaceState({}, "", `?${URLString}`);
}

function encodePianos() {
  let URLString = "";
  for (let piano of uiEls.pianos) {
    URLString += "base=" + piano.obj.base + "&";
    URLString += "notes=" + piano.obj.notes.join("+").replace(/\#/g, "^");
    URLString += "&";
  }
  console.log(URLString);
  return URLString;
}

function getQueryString() {
  return window.location.search.toString();
}

function decodePianosFromURL(queryString) {
  if (!isValidQueryString(queryString)) {
    console.log("invalid query string: ", queryString);
    console.log("defaulting to 1 piano with base 2");
    addPiano(2);
    return;
  }
  console.log("valid query string: ", queryString);

  let params = new URLSearchParams(queryString);
  let entries = params.entries();
  for (let property of entries) {
    if (property[0] === "base") {
      let pianoDiv = addPiano(property[1]);

      let notes = entries.next().value[1];
      pianoDiv.obj.notes = notes.replace(/\^/g, "#").split(" ");
    }
  }
  updateKeyboardUI();
}

function isValidQueryString(queryString) {
  const rePattern =
    /((base=([2-9]|10))\&(notes=([A-G]\^?[0-7]\+){2,9}([A-G]\^?[0-7]))\&)+/;

  if (queryString.match(rePattern)) {
    return true;
  } else {
    return false;
  }
}

window.onload = () => {
  // Tone.Context().resume();
  decodePianosFromURL(getQueryString());
  bindUI();
};
