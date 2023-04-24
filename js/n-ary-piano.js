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

var pianos = document.getElementsByClassName("piano");

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const addPianoButton = document.getElementById("add-piano");

// new pianos are added after the previous piano
var prevPiano = document.getElementById("anchor");
var activePiano = document.getElementsByClassName("active piano")[0];

// the note input element that is changed by clicking the keyboard
var selectedNoteInput = document.getElementsByClassName("selected")[0];

var keyboard = document.getElementById("piano-keyboard");

var noteInputArea = document.getElementById("notes");

// set up interactions for keyboard and note UI
function initUI() {
  keyboard.addEventListener("click", (ev) => {
    selectedNoteInput.value = ev.target.dataset.pianoKey;
    let selectedIndex = +selectedNoteInput.dataset.index;

    activePiano.obj.notes[selectedIndex] = ev.target.dataset.pianoKey;

    let nextIndex = selectedIndex + 1;
    if (nextIndex >= activePiano.obj.notes.length) { // cycle notes
      nextIndex = nextIndex % activePiano.obj.notes.length;
    }
    console.log("next index:", nextIndex);
    let nextNoteInput =
      document.querySelectorAll(`[data-index='${nextIndex}']`)[0];
    console.log("next input area:", nextNoteInput);
    selectNoteInput(nextNoteInput);
    // let focusedNote = noteInputArea.querySelector(":focus");
    // focusedNote.value = ev.target.dataset.pianoKey;
  });

  noteInputArea.addEventListener("click", (ev) => {
    selectNoteInput(ev.target);
  });
}

// highlight the given note element
function selectNoteInput(noteElement) {
  if (noteElement.tagName === "INPUT") {
    selectedNoteInput.classList.remove("selected");
    noteElement.classList.add("selected");
    selectedNoteInput = noteElement;
  }
}

addPianoButton.addEventListener("click", () => {
  let base = prompt("Enter base: ", [2, 3, 4, 5, 6, 7, 8, 9, 10]);
  addPiano(base);
});

var numPianos = 0;
// adds a new piano with the given base to the page
function addPiano(base) {
  let piano = new Piano(base);

  const pianoDiv = document.createElement("div");
  pianoDiv.classList.add("piano");
  numPianos++;
  // pianoDiv.id = `p-${numPianos}`;
  pianoDiv.setAttribute("id", `p-${numPianos}`);
  // pianoDiv.dataset.val = 0;
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
  baseChangeInput.setAttribute("id", `base-${numPianos}`);
  baseChangeInput.setAttribute("name", "select-base");
  baseChangeInput.setAttribute("min", "2");
  baseChangeInput.setAttribute("max", "10");
  baseChangeInput.addEventListener("input", (ev) => {
    console.log(ev.target.value);
    changeBase(ev.target.parentElement, ev.target.value);
  });
  pianoDiv.appendChild(baseChangeInput);

  prevPiano.after(pianoDiv);
  prevPiano = pianoDiv;
  pianos = document.getElementsByClassName("piano");

  makeActivePiano(pianoDiv);
}

// this.base = base;
// this.maxDigit = (base - 1).toString();
// this.notes = defaults[base].notes;
// this.durations = defaults[base].durations;
// this.max = Math.pow(base, defaults[base].padding.length) - 1;
// this.prevArr = [];
// this.padding = defaults[base].padding;

function changeBase(piano, base) {
  piano.dataset.val = 0;
  piano.obj = new Piano(base);

  console.log(piano);
  console.log(piano.firstChild.nodeValue);
  piano.firstChild.nodeValue = piano.obj.padding;
  updateKeyboardUI();
}

function makeActivePiano(selectedPiano) {
  // console.log("ap before: ", activePiano);
  if (activePiano === selectedPiano) {
    // console.log("Already active element, doing nothing");
    updateKeyboardUI();
    return;
  }
  // console.log("making", element, "the active piano");
  selectedPiano.classList.add("active");
  // console.log("active piano notes: ", element.obj.notes);

  activePiano.classList.remove("active");
  // activePiano = document.getElementsByClassName("active piano")[0];
  activePiano = selectedPiano;
  // console.log("ap after: ", activePiano);
  updateKeyboardUI();
}

function updateKeyboardUI() {
  let activePianoNotes = activePiano.obj.notes;

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

  // change display of number
}

startButton.addEventListener("click", () => {
  let synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      partials: [0, 2, 3, 4],
    },
  }).toDestination();

  pianos = document.getElementsByClassName("piano");
  console.log("pianos: ", pianos);
  Tone.Transport.bpm.value = 50;
  //play a note every eighth note starting from the first measure
  Tone.Transport.scheduleRepeat(
    function (time) {
      for (let piano of pianos) {
        let count = piano.dataset.val;
        console.log("piano: ", piano);
        let countString = (+count).toString(piano.obj.base);
        let pad = piano.obj.padding.substring(
          0,
          piano.obj.padding.length - countString.length,
        );
        let padString = pad + countString;
        let paddedArr = padString.split("");
        // console.log(paddedArr.length, paddedArr);

        for (let i = 0; i < paddedArr.length; i++) {
          if (
            paddedArr[i] === piano.obj.maxDigit &&
            piano.obj.prevArr[i] !== piano.obj.maxDigit
          ) {
            // play a chord
            synth.triggerAttackRelease(
              piano.obj.notes[i],
              piano.obj.durations[i],
              time,
            );
          }
        }

        piano.obj.prevArr = paddedArr;
        piano.firstChild.textContent = padString;
        piano.dataset.val++;
        if (piano.dataset.val == piano.obj.max) {
          piano.dataset.val == 0;
        }
      }
    },
    "16n",
    "1m",
  );
  Tone.Transport.start();
});

stopButton.addEventListener("click", () => {
  Tone.Transport.stop();
});

window.onload = () => {
  addPiano(2);
  document.getElementById("anchor").classList.remove("piano");
  initUI();
};
