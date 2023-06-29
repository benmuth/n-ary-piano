"use strict";

// import { PolySynth } from "tone";

import * as Tone from "tone";

// const { start } = require("tone");

var playSVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" width="30" >
 <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
  </svg>`;
var stopSVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" width="30">
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
  base: number;
  maxDigit: string;
  notes: string[];
  durations: number[];
  max: number;
  previousArray: string[];
  padding: string;

  constructor(base: number) {
    base = base ?? 2;

    console.log("new piano with base: ", base);
    this.base = base;
    this.maxDigit = (base - 1).toString();
    this.notes = defaults[base].notes.slice();
    this.durations = defaults[base].durations.slice();
    this.max = Math.pow(base, defaults[base].padding.length) - 1;
    this.previousArray = [];
    this.padding = defaults[base].padding;
  }
}

interface pianoElement extends HTMLElement {
  piano: Piano;
}

let uiState = {
  pianos: document.getElementsByClassName("piano") as HTMLCollectionOf<
    pianoElement
  >,
  playButton: document.getElementById("play") as HTMLElement,

  // stopButton: document.getElementById("stop"),
  addPianoButton: document.getElementById("add-piano") as HTMLElement,

  // new pianos are added after the previous piano
  prevPiano: document.getElementById("anchor") as HTMLElement,
  activePiano: document.getElementsByClassName(
    "active piano",
  )[0] as pianoElement,

  // the note input element that is changed by clicking the keyboard
  selectedNoteInput: document.getElementsByClassName(
    "selected",
  )[0] as HTMLInputElement,

  keyboard: document.getElementById("piano-keyboard") as HTMLElement,

  noteInputArea: document.getElementById("notes") as HTMLElement,
};

let logicState = {
  played: false,
  playing: false,
};

// set up interactions for keyboard and note UI
function bindUI() {
  let synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      partials: [0, 2, 3, 4],
    },
  }).toDestination();

  // clicking on a key
  if (uiState.keyboard !== null) {
    uiState.keyboard.addEventListener("click", (ev) => {
      let keyElement = ev.target as HTMLElement;

      if ((ev.target as Element).id === "piano-keyboard") {
        // this means the click "missed" all keys and hit the underlying piano
        return;
      }
      let clickedKey = keyElement.dataset.pianoKey ?? "C3"; // the note value of the clicked key
      synth.triggerAttackRelease(clickedKey, 0.4);
      let selectedNoteElement = uiState.selectedNoteInput as HTMLElement;
      let selectedNoteIndex = +(selectedNoteElement.dataset.index ?? 0); // the index of the selected note input (0-9)

      let nextIndex = getNextNoteIndex(selectedNoteIndex);

      uiState.selectedNoteInput.value = clickedKey;
      uiState.activePiano.piano.notes[selectedNoteIndex] = clickedKey;

      let nextNoteInput = document.querySelectorAll(
        `[data-index='${nextIndex}']`,
      )[0] as HTMLInputElement;

      selectNoteInput(nextNoteInput);
      updateKeyboardUI();
    });
  }

  // clicking on a note input
  uiState.noteInputArea.addEventListener("click", (ev) => {
    let noteInput = ev.target as HTMLInputElement;
    selectNoteInput(noteInput);
  });

  // clicking on the start button
  uiState.playButton.addEventListener("click", () => {
    // let ctx = new AudioContext();
    // let toneCtx = new Tone.Context(ctx);
    // let synth = new Tone.PolySynth(8, Tone.Synth, {
    //   oscillator: {
    //     partials: [0, 2, 3, 4],
    //   },
    // }).toMaster();
    if (!logicState.played) {
      Tone.Transport.start();
      uiState.playButton.innerHTML = stopSVG;
      logicState.playing = true;
      logicState.played = true;
      return;
    }

    Tone.Transport.toggle();

    if (logicState.playing) {
      // Tone.Transport.cancel();
      logicState.playing = false;
      uiState.playButton.innerHTML = playSVG;
    } else {
      // toneCtx.resume();
      logicState.playing = true;
      uiState.playButton.innerHTML = stopSVG;
    }
  });

  // clicking on the add piano button
  uiState.addPianoButton.addEventListener("click", () => {
    let base = prompt("Enter base: ", "2, 3, 4, 5, 6, 7, 8, 9, 10");
    if (base) {
      addPiano(parseInt(base, 10));
    }
  });

  let initButton = document.getElementById("init");
  if (initButton) {
    initButton.addEventListener("click", () => {
      let synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          partials: [0, 2, 3, 4],
        },
      }).toDestination();
      uiState.pianos = document.getElementsByClassName(
        "piano",
      ) as HTMLCollectionOf<pianoElement>;
      console.log("pianos: ", uiState.pianos);
      Tone.Transport.bpm.value = 80;
      //play a note every eighth note starting from the first measure
      Tone.Transport.scheduleRepeat(
        (time: number) => updateAndPlayPianos(time, synth),
        "16n",
        "1m",
      );
      // synth = Tone.start();
    });
  }
}

function getNextNoteIndex(currentNoteIndex: number) {
  let nextIndex = currentNoteIndex + 1;
  if (nextIndex >= uiState.activePiano.piano.notes.length) {
    // cycle notes
    nextIndex = nextIndex % uiState.activePiano.piano.notes.length;
  }
  return nextIndex;
}

// highlight the given note element
function selectNoteInput(noteElement: HTMLInputElement) {
  if (noteElement.tagName === "INPUT") {
    uiState.selectedNoteInput.classList.remove("selected");
    noteElement.classList.add("selected");
    uiState.selectedNoteInput = noteElement;
    setPianosInURL();
    updateKeyboardUI();
  }
}

// adds a new piano with the given base to the page
function addPiano(base: number) {
  // remove initial dummy piano
  let anchorPiano = document.getElementById("anchor");
  if (anchorPiano !== null) {
    anchorPiano.classList.remove("piano");
  }

  // create new piano div
  const pianoDiv = document.createElement("div") as unknown as pianoElement;
  pianoDiv.classList.add("piano");

  pianoDiv.setAttribute("id", `p-${uiState.pianos.length}`);
  pianoDiv.setAttribute("data-val", "0");
  pianoDiv.piano = new Piano(base);

  // add remove button to piano
  const removeButton = document.createElement("button");
  removeButton.classList.add("remove-button");
  removeButton.addEventListener("click", (e) => {
    let button = e.currentTarget as HTMLElement;
    let parentPiano = button.parentElement as pianoElement;
    if (button && parentPiano) {
      removePiano(parentPiano);
    }
  });
  pianoDiv.appendChild(removeButton);

  // add select button to piano
  const selectButton = document.createElement("button");
  selectButton.classList.add("select-button");
  selectButton.addEventListener("click", (e) => {
    let button = e.currentTarget as HTMLElement;
    let parentPiano = button.parentElement as pianoElement;
    if (button && button.parentElement) {
      makeActivePiano(parentPiano);
    }
  });
  pianoDiv.appendChild(selectButton);

  // add piano numbers to piano
  const pianoNumbers = document.createElement("span");
  pianoNumbers.textContent = pianoDiv.piano.padding;
  pianoNumbers.classList.add("piano-numbers");
  pianoDiv.appendChild(pianoNumbers);

  // add base change input to piano
  const baseChangeInput = document.createElement("input");
  baseChangeInput.setAttribute("type", "number");
  baseChangeInput.setAttribute("id", `base-${uiState.pianos.length}`);
  baseChangeInput.setAttribute("name", "select-base");
  baseChangeInput.setAttribute("min", "2");
  baseChangeInput.setAttribute("max", "10");
  baseChangeInput.classList.add("base-input");
  baseChangeInput.addEventListener("input", (ev) => {
    let inputField = ev.target as HTMLInputElement;
    if (inputField) {
      let parentPiano = inputField.parentElement as pianoElement;
      console.log(inputField.value);
      if (parentPiano) {
        changeBase(parentPiano, parseInt(inputField.value, 10));
      }
    }
  });
  pianoDiv.appendChild(baseChangeInput);

  console.log("prev: ", uiState.prevPiano);
  console.log("to add: ", pianoDiv);
  uiState.prevPiano.after(pianoDiv);
  uiState.prevPiano = pianoDiv;

  uiState.pianos = document.getElementsByClassName("piano") as HTMLCollectionOf<
    pianoElement
  >;

  makeActivePiano(pianoDiv);

  setPianosInURL();
  return pianoDiv;
}

function changeBase(piano: pianoElement, base: number) {
  piano.dataset.val = "0";
  piano.piano = new Piano(base);

  // console.log(piano);
  // console.log(piano.firstChild.nodeValue);

  let pianoChildren = piano.children as HTMLCollectionOf<HTMLElement>;
  for (const child of pianoChildren) {
    if (child.classList.contains("piano-numbers")) {
      child.textContent = piano.piano.padding;
      console.log("new piano numbers: ", piano.piano.padding);
      break;
    }
  }
  updateKeyboardUI();
  setPianosInURL();
}

function makeActivePiano(selectedPiano: pianoElement) {
  if (uiState.activePiano === selectedPiano) {
    updateKeyboardUI();
    return;
  }
  selectedPiano.classList.add("active");
  uiState.activePiano.classList.remove("active");
  uiState.activePiano = selectedPiano;
  updateKeyboardUI();
}

function removePiano(selectedPiano: pianoElement) {
  if (uiState.pianos.length === 1 && selectedPiano === uiState.pianos[0]) {
    console.log("EQUALS");
    return;
  }
  selectedPiano.remove();
  uiState.pianos = document.getElementsByClassName("piano") as HTMLCollectionOf<
    pianoElement
  >;
  makeActivePiano(uiState.pianos[0]);
  uiState.prevPiano = uiState.pianos[uiState.pianos.length - 1];
}

function updateKeyboardUI() {
  let activePianoNotes = uiState.activePiano.piano.notes;

  const noteContainer = document.getElementById("notes");
  if (noteContainer) {
    let notes = noteContainer.children as HTMLCollectionOf<HTMLInputElement>;
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
    let keyboard = document.getElementById("piano-keyboard");
    if (keyboard) {
      let keys = keyboard.children;
      let keysToHighlight: HTMLElement[] = [];
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i] as HTMLElement;
        // remove playing notes from previous piano
        key.classList.remove("playing");
        // pick selected keys
        key.classList.remove("highlight");
        key.classList.remove("selected");
        for (let j = 0; j < activePianoNotes.length; j++) {
          if (notes[j].value === key.dataset.pianoKey) {
            keysToHighlight.push(key);
            if (notes[j].classList.contains("selected")) {
              key.classList.add("selected");
            }
          }
        }
      }
      for (let i = 0; i < keysToHighlight.length; i++) {
        keysToHighlight[i].classList.add("highlight");
      }
    }
  }
}

function updateAndPlayPianos(time: number, synth: Tone.PolySynth) {
  for (let piano of uiState.pianos) {
    uiState.pianos = document.getElementsByClassName(
      "piano",
    ) as HTMLCollectionOf<pianoElement>;
    let display = makePianoDisplayString(piano);
    let displayArr = display.split("");

    for (let i = 0; i < displayArr.length; i++) {
      let shouldPlayNote = displayArr[i] === piano.piano.maxDigit &&
        piano.piano.previousArray[i] !== piano.piano.maxDigit;
      if (shouldPlayNote) {
        synth.triggerAttackRelease(
          piano.piano.notes[i],
          piano.piano.durations[i],
          time,
        );
        let keys = uiState.keyboard.children as HTMLCollectionOf<HTMLElement>;
        for (let key of keys) {
          if (key.dataset.pianoKey == uiState.activePiano.piano.notes[i]) {
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
    piano.piano.previousArray = displayArr;
    // piano.dataset.val++;
    if (piano.dataset.val) {
      let val = parseInt(piano.dataset.val, 10);
      val++;
      piano.dataset.val = val.toString(10);

      if (parseInt(piano.dataset.val, 10) == piano.piano.max) {
        piano.dataset.val = "0";
      }
    }
  }
}

function makePianoDisplayString(piano: pianoElement) {
  let count = piano.dataset.val;
  if (count) {
    let countString = (+count).toString(piano.piano.base);
    let zeroPadding = piano.piano.padding.substring(
      0,
      piano.piano.padding.length - countString.length,
    );
    return zeroPadding + countString;
  }
  return "";
}

function setPianosInURL() {
  let URLString = encodePianos();
  history.replaceState({}, "", `?${URLString}`);
}

function encodePianos() {
  let URLString = "";
  for (let piano of uiState.pianos) {
    URLString += "base=" + piano.piano.base + "&";
    URLString += "notes=" + piano.piano.notes.join("+").replace(/\#/g, "^");
    URLString += "&";
  }
  console.log(URLString);
  return URLString;
}

function getQueryString() {
  return window.location.search.toString();
}

function decodePianosFromURL(queryString: string) {
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
      let pianoDiv = addPiano(parseInt(property[1], 10));

      let notes = entries.next().value[1];
      pianoDiv.piano.notes = notes.replace(/\^/g, "#").split(" ");
    }
  }
  updateKeyboardUI();
}

function isValidQueryString(queryString: string) {
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
