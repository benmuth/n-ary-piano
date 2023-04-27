"use strict";
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
    this.notes = defaults[base].notes;
    this.durations = defaults[base].durations;
    this.max = Math.pow(base, defaults[base].padding.length) - 1;
    this.prevArr = [];
    this.padding = defaults[base].padding;
  }
}

let uiEls = {
  pianos: document.getElementsByClassName("piano"),
  startButton: document.getElementById("start"),

  stopButton: document.getElementById("stop"),
  addPianoButton: document.getElementById("add-piano"),

  // new pianos are added after the previous piano
  prevPiano: document.getElementById("anchor"),
  activePiano: document.getElementsByClassName("active piano")[0],

  // the note input element that is changed by clicking the keyboard
  selectedNoteInput: document.getElementsByClassName("selected")[0],

  keyboard: document.getElementById("piano-keyboard"),

  noteInputArea: document.getElementById("notes"),
};

// set up interactions for keyboard and note UI
function bindUI() {
  uiEls.keyboard.addEventListener("click", (ev) => {
    if (ev.target.id === "piano-keyboard") {
      return;
    }

    uiEls.selectedNoteInput.value = ev.target.dataset.pianoKey;
    let selectedIndex = +uiEls.selectedNoteInput.dataset.index;
    uiEls.activePiano.obj.notes[selectedIndex] = ev.target.dataset.pianoKey;
    let nextIndex = getNextNoteIndex(selectedIndex);
    // console.log("next index:", nextIndex);
    let nextNoteInput =
      document.querySelectorAll(`[data-index='${nextIndex}']`)[0];
    // console.log("next input area:", nextNoteInput);
    selectNoteInput(nextNoteInput);
  });

  uiEls.noteInputArea.addEventListener("click", (ev) => {
    selectNoteInput(ev.target);
  });
}

function getNextNoteIndex(currentNoteIndex) {
  let nextIndex = currentNoteIndex + 1;
  if (nextIndex >= uiEls.activePiano.obj.notes.length) { // cycle notes
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
  }
}

uiEls.addPianoButton.addEventListener("click", () => {
  let base = prompt("Enter base: ", [2, 3, 4, 5, 6, 7, 8, 9, 10]);
  addPiano(base);
});

// adds a new piano with the given base to the page
function addPiano(base) {
  // remove initial dummy piano
  document.getElementById("anchor").classList.remove("piano");

  let piano = new Piano(base);

  const pianoDiv = document.createElement("div");
  pianoDiv.classList.add("piano");

  pianoDiv.setAttribute("id", `p-${uiEls.pianos.length}`);
  pianoDiv.setAttribute("data-val", "0");
  pianoDiv.obj = piano;

  const pianoNumbers = document.createTextNode(piano.padding);
  pianoDiv.appendChild(pianoNumbers);

  const selectButton = document.createElement("button");
  selectButton.textContent = "Select";
  selectButton.addEventListener("click", (e) => {
    makeActivePiano(e.currentTarget.parentElement);
  });
  pianoDiv.appendChild(selectButton);

  const baseChangeInput = document.createElement("input");
  baseChangeInput.setAttribute("type", "number");
  baseChangeInput.setAttribute("id", `base-${uiEls.pianos.length}`);
  baseChangeInput.setAttribute("name", "select-base");
  baseChangeInput.setAttribute("min", "2");
  baseChangeInput.setAttribute("max", "10");
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
  return pianoDiv;
}

function changeBase(piano, base) {
  piano.dataset.val = 0;
  piano.obj = new Piano(base);

  console.log(piano);
  console.log(piano.firstChild.nodeValue);
  piano.firstChild.nodeValue = piano.obj.padding;
  updateKeyboardUI();
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
}

uiEls.startButton.addEventListener("click", () => {
  let synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      partials: [0, 2, 3, 4],
    },
  }).toDestination();

  uiEls.pianos = document.getElementsByClassName("piano");
  console.log("pianos: ", uiEls.pianos);
  Tone.Transport.bpm.value = 50;
  //play a note every eighth note starting from the first measure
  Tone.Transport.scheduleRepeat(
    (time) => updateAndPlayPianos(time, synth),
    "16n",
    "1m",
  );
  Tone.start();
  Tone.Transport.start();
});

function updateAndPlayPianos(time, synth) {
  for (let piano of uiEls.pianos) {
    let display = makePianoDisplayString(piano);
    let displayArr = display.split("");

    for (let i = 0; i < displayArr.length; i++) {
      let shouldPlayNote = displayArr[i] === piano.obj.maxDigit &&
        piano.obj.prevArr[i] !== piano.obj.maxDigit;
      if (shouldPlayNote) {
        synth.triggerAttackRelease(
          piano.obj.notes[i],
          piano.obj.durations[i],
          time,
        );
      }
    }

    // update piano data
    piano.firstChild.textContent = display;
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
    piano.obj.padding.length - countString.length,
  );
  return zeroPadding + countString;
}

uiEls.stopButton.addEventListener("click", () => {
  // Tone.Transport.stop();
  // Tone.Transport.pause();
  Tone.Transport.toggle();
});

function setPianosInURL() {
  let URLString = encodePianos();
  history.replaceState({}, "", `?${URLString}`);
}

function encodePianos() {
  let URLString = "";
  for (let piano of uiEls.pianos) {
    URLString += "id=" + piano.id + "&";
    URLString += "base=" + piano.obj.base + "&";
    URLString += "notes=" + piano.obj.notes.join("+");
  }
  console.log(URLString);
  return URLString;
}

function getQueryString() {
  return window.location.search.toString();
}

function decodePianosFromURL(queryString) {
  if (isValidQueryString(queryString)) {
    console.log("valid query string");
  }
}

function isValidQueryString(queryString) {
  console.log("queryString: ", queryString)
  let re = queryString.match(/((id=p-[0-9])\&(base=([2-9]|10))\&(notes=([A-G]\^?[0-7]\+){2,9}([A-G]\^?[0-7]))\&$)/);
  console.log("re: ", re)
  if (re) {
    console.log("valid query string");
    return true
  } else {
    console.log("invalid query string");
    return false
  }
}

window.onload = () => {
  addPiano(2);
  bindUI();
  let urlString = encodePianos();
  decodePianosFromURL(urlString);

  addPiano(8);
  urlString = encodePianos();
  decodePianosFromURL(urlString);
  // decodePianosFromURL("A6");
};
