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

var defaults = {
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

class Piano {
  constructor(base) {
    this.base = base;
    this.maxDigit = (base - 1).toString();
    this.notes = defaults[base].notes;
    this.durations = defaults[base].durations;
    this.max = Math.pow(base, defaults[base].padding.length) - 1;
    this.prevArr = [];
    this.padding = defaults[base].padding;
  }
}

// var number = document.getElementById("number");
var pianos = document.getElementsByClassName("piano");

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const addPianoButton = document.getElementById("add-piano");

var prevPiano = document.getElementById("anchor");
// var activePianos = document.getElementsByClassName("active piano");
var prevActivePiano = document.getElementsByClassName("active piano")[0];

// var notes = ["D4", "E4", "F4", "G4", "A5", "C5", "D5", "E5", "F5", "G5"];
// var durations = [1.7, 1.5, 1.3, 1.2, 0.9, 0.7, 0.6, 0.5, 0.5, 0.4];

var keys = document.getElementsByClassName("piano-key");

var noteInputs = document.getElementsByTagName("input");

function initUI() {
  for (let key of keys) {
    key.addEventListener("click", (ev) => {
      // assignToActiveNote(ev.target.dataset.pianoKey);
      console.log("clicked: ", key.dataset.pianoKey);
    });
  }

  // for (let i = 0; i < noteInputs.length; i++) {
  //   noteInputs[i].value = activePiano.notes[i];
  // }
}

// function assignToActiveNote(pianoKey) {
//   let activeNote = document.getElementsByClassName("active")[0];
//   activeNote.dataset.pianoKey = pianoKey;
// }

addPianoButton.addEventListener("click", () => {
  let base = prompt("Enter base: ", [2, 3, 4, 5, 6, 7, 8, 9, 10]);
  addPiano(base);
});

function addPiano(base) {
  let piano = new Piano(base);

  const pianoDiv = document.createElement("div");
  pianoDiv.classList.add("piano");
  pianoDiv.id = `p-${base}`;
  pianoDiv.dataset.val = 0;
  pianoDiv.obj = piano;

  const pianoNumbers = document.createTextNode(piano.padding);

  pianoDiv.appendChild(pianoNumbers);

  const selectButton = document.createElement("button");

  selectButton.textContent = "Select";

  pianoDiv.addEventListener("click", (e) => {
    makeActivePiano(e.currentTarget);
  });
  pianoDiv.appendChild(selectButton);

  prevPiano.after(pianoDiv);
  prevPiano = pianoDiv;
  pianos = document.getElementsByClassName("piano");

  makeActivePiano(pianoDiv);
}

function makeActivePiano(element) {
  // console.log("ap before: ", prevActivePiano);
  // console.log("making", element, "the active piano");
  element.classList.add("active");
  // console.log("active piano notes: ", element.obj.notes);
  let activeNotes = element.obj.notes;

  const noteContainer = document.getElementsByClassName("notes")[0];
  let noteInputs = noteContainer.children;

  for (let i = 0; i < noteInputs.length; i++) {
    if (i < activeNotes.length) {
      noteInputs[i].toggleAttribute("hidden", false);
      noteInputs[i].value = activeNotes[i];
    } else {
      noteInputs[i].toggleAttribute("hidden", true);
    }
  }
  prevActivePiano.classList.remove("active");
  // console.log("ap clist: ", activePianos[0].classList.contains("active"));
  prevActivePiano = document.getElementsByClassName("active piano")[0];
  // console.log("ap after: ", prevActivePiano);
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
