"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { PolySynth } from "tone";
var Tone = require("tone");
// const { start } = require("tone");
var playSVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6\" width=\"30\" >\n <path fill-rule=\"evenodd\" d=\"M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z\" clip-rule=\"evenodd\" />\n  </svg>";
var stopSVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-6 h-6\" width=\"30\">\n<path fill-rule=\"evenodd\" d=\"M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z\" clip-rule=\"evenodd\" />\n</svg>";
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
// holds all the data for a piano
var Piano = /** @class */ (function () {
    function Piano(base) {
        base = base !== null && base !== void 0 ? base : 2;
        console.log("new piano with base: ", base);
        this.base = base;
        this.maxDigit = (base - 1).toString();
        this.notes = defaults[base].notes.slice();
        this.durations = defaults[base].durations.slice();
        this.max = Math.pow(base, defaults[base].padding.length) - 1;
        this.previousArray = [];
        this.padding = defaults[base].padding;
    }
    return Piano;
}());
var uiState = {
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
var logicState = {
    played: false,
    playing: false,
};
// set up interactions for keyboard and note UI
function bindUI() {
    var synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            partials: [0, 2, 3, 4],
        },
    }).toDestination();
    // clicking on a key
    if (uiState.keyboard !== null) {
        uiState.keyboard.addEventListener("click", function (ev) {
            var _a, _b;
            var keyElement = ev.target;
            if (ev.target.id === "piano-keyboard") {
                // this means the click "missed" all keys and hit the underlying piano
                return;
            }
            var clickedKey = (_a = keyElement.dataset.pianoKey) !== null && _a !== void 0 ? _a : "C3"; // the note value of the clicked key
            synth.triggerAttackRelease(clickedKey, 0.4);
            var selectedNoteElement = uiState.selectedNoteInput;
            var selectedNoteIndex = +((_b = selectedNoteElement.dataset.index) !== null && _b !== void 0 ? _b : 0); // the index of the selected note input (0-9)
            var nextIndex = getNextNoteIndex(selectedNoteIndex);
            uiState.selectedNoteInput.value = clickedKey;
            uiState.activePiano.piano.notes[selectedNoteIndex] = clickedKey;
            var nextNoteInput = document.querySelectorAll("[data-index='".concat(nextIndex, "']"))[0];
            selectNoteInput(nextNoteInput);
            updateKeyboardUI();
        });
    }
    // clicking on a note input
    uiState.noteInputArea.addEventListener("click", function (ev) {
        var noteInput = ev.target;
        selectNoteInput(noteInput);
    });
    // clicking on the start button
    uiState.playButton.addEventListener("click", function () {
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
        }
        else {
            // toneCtx.resume();
            logicState.playing = true;
            uiState.playButton.innerHTML = stopSVG;
        }
    });
    // clicking on the add piano button
    uiState.addPianoButton.addEventListener("click", function () {
        var base = prompt("Enter base: ", "2, 3, 4, 5, 6, 7, 8, 9, 10");
        if (base) {
            addPiano(parseInt(base, 10));
        }
    });
    var initButton = document.getElementById("init");
    if (initButton) {
        initButton.addEventListener("click", function () {
            var synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    partials: [0, 2, 3, 4],
                },
            }).toDestination();
            uiState.pianos = document.getElementsByClassName("piano");
            console.log("pianos: ", uiState.pianos);
            Tone.Transport.bpm.value = 80;
            //play a note every eighth note starting from the first measure
            Tone.Transport.scheduleRepeat(function (time) { return updateAndPlayPianos(time, synth); }, "16n", "1m");
            // synth = Tone.start();
        });
    }
}
function getNextNoteIndex(currentNoteIndex) {
    var nextIndex = currentNoteIndex + 1;
    if (nextIndex >= uiState.activePiano.piano.notes.length) {
        // cycle notes
        nextIndex = nextIndex % uiState.activePiano.piano.notes.length;
    }
    return nextIndex;
}
// highlight the given note element
function selectNoteInput(noteElement) {
    if (noteElement.tagName === "INPUT") {
        uiState.selectedNoteInput.classList.remove("selected");
        noteElement.classList.add("selected");
        uiState.selectedNoteInput = noteElement;
        setPianosInURL();
        updateKeyboardUI();
    }
}
// adds a new piano with the given base to the page
function addPiano(base) {
    // remove initial dummy piano
    var anchorPiano = document.getElementById("anchor");
    if (anchorPiano !== null) {
        anchorPiano.classList.remove("piano");
    }
    // create new piano div
    var pianoDiv = document.createElement("div");
    pianoDiv.classList.add("piano");
    pianoDiv.setAttribute("id", "p-".concat(uiState.pianos.length));
    pianoDiv.setAttribute("data-val", "0");
    pianoDiv.piano = new Piano(base);
    // add remove button to piano
    var removeButton = document.createElement("button");
    removeButton.classList.add("remove-button");
    removeButton.addEventListener("click", function (e) {
        var button = e.currentTarget;
        var parentPiano = button.parentElement;
        if (button && parentPiano) {
            removePiano(parentPiano);
        }
    });
    pianoDiv.appendChild(removeButton);
    // add select button to piano
    var selectButton = document.createElement("button");
    selectButton.classList.add("select-button");
    selectButton.addEventListener("click", function (e) {
        var button = e.currentTarget;
        var parentPiano = button.parentElement;
        if (button && button.parentElement) {
            makeActivePiano(parentPiano);
        }
    });
    pianoDiv.appendChild(selectButton);
    // add piano numbers to piano
    var pianoNumbers = document.createElement("span");
    pianoNumbers.textContent = pianoDiv.piano.padding;
    pianoNumbers.classList.add("piano-numbers");
    pianoDiv.appendChild(pianoNumbers);
    // add base change input to piano
    var baseChangeInput = document.createElement("input");
    baseChangeInput.setAttribute("type", "number");
    baseChangeInput.setAttribute("id", "base-".concat(uiState.pianos.length));
    baseChangeInput.setAttribute("name", "select-base");
    baseChangeInput.setAttribute("min", "2");
    baseChangeInput.setAttribute("max", "10");
    baseChangeInput.classList.add("base-input");
    baseChangeInput.addEventListener("input", function (ev) {
        var inputField = ev.target;
        if (inputField) {
            var parentPiano = inputField.parentElement;
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
    uiState.pianos = document.getElementsByClassName("piano");
    makeActivePiano(pianoDiv);
    setPianosInURL();
    return pianoDiv;
}
function changeBase(piano, base) {
    piano.dataset.val = "0";
    piano.piano = new Piano(base);
    // console.log(piano);
    // console.log(piano.firstChild.nodeValue);
    var pianoChildren = piano.children;
    // for (const child of pianoChildren) {
    for (var i = 0; i < pianoChildren.length; i++) {
        var child = pianoChildren[i];
        if (child.classList.contains("piano-numbers")) {
            child.textContent = piano.piano.padding;
            console.log("new piano numbers: ", piano.piano.padding);
            break;
        }
    }
    updateKeyboardUI();
    setPianosInURL();
}
function makeActivePiano(selectedPiano) {
    if (uiState.activePiano === selectedPiano) {
        updateKeyboardUI();
        return;
    }
    selectedPiano.classList.add("active");
    uiState.activePiano.classList.remove("active");
    uiState.activePiano = selectedPiano;
    updateKeyboardUI();
}
function removePiano(selectedPiano) {
    if (uiState.pianos.length === 1 && selectedPiano === uiState.pianos[0]) {
        console.log("EQUALS");
        return;
    }
    selectedPiano.remove();
    uiState.pianos = document.getElementsByClassName("piano");
    makeActivePiano(uiState.pianos[0]);
    uiState.prevPiano = uiState.pianos[uiState.pianos.length - 1];
}
function updateKeyboardUI() {
    var activePianoNotes = uiState.activePiano.piano.notes;
    var noteContainer = document.getElementById("notes");
    if (noteContainer) {
        var notes = noteContainer.children;
        // change display of notes to match active piano
        for (var i = 0; i < notes.length; i++) {
            if (i < activePianoNotes.length) {
                notes[i].toggleAttribute("hidden", false);
                notes[i].value = activePianoNotes[i];
            }
            else {
                notes[i].toggleAttribute("hidden", true);
            }
        }
        // highlight selected notes on keyboard
        var keyboard = document.getElementById("piano-keyboard");
        if (keyboard) {
            var keys = keyboard.children;
            var keysToHighlight = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                // remove playing notes from previous piano
                key.classList.remove("playing");
                // pick selected keys
                key.classList.remove("highlight");
                key.classList.remove("selected");
                for (var j = 0; j < activePianoNotes.length; j++) {
                    if (notes[j].value === key.dataset.pianoKey) {
                        keysToHighlight.push(key);
                        if (notes[j].classList.contains("selected")) {
                            key.classList.add("selected");
                        }
                    }
                }
            }
            for (var i = 0; i < keysToHighlight.length; i++) {
                keysToHighlight[i].classList.add("highlight");
            }
        }
    }
}
function updateAndPlayPianos(time, synth) {
    // for (let piano of uiState.pianos) {
    for (var i = 0; i < uiState.pianos.length; i++) {
        var piano = uiState.pianos[i];
        uiState.pianos = document.getElementsByClassName("piano");
        var display = makePianoDisplayString(piano);
        var displayArr = display.split("");
        for (var i_1 = 0; i_1 < displayArr.length; i_1++) {
            var shouldPlayNote = displayArr[i_1] === piano.piano.maxDigit &&
                piano.piano.previousArray[i_1] !== piano.piano.maxDigit;
            if (shouldPlayNote) {
                synth.triggerAttackRelease(piano.piano.notes[i_1], piano.piano.durations[i_1], time);
                var keys = uiState.keyboard.children;
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    // for (let i = 0; i < keys.length; i++) {
                    //   let key = keys[i];
                    if (key.dataset.pianoKey == uiState.activePiano.piano.notes[i_1]) {
                        key.classList.add("playing");
                    }
                    else {
                        key.classList.remove("playing");
                    }
                }
            }
        }
        // update piano data
        for (var _a = 0, _b = piano.children; _a < _b.length; _a++) {
            var child = _b[_a];
            // for (let i = 0; i < piano.children.length; i++) {
            //   let child = piano.children[i];
            if (child.classList.contains("piano-numbers")) {
                child.textContent = display;
            }
        }
        // piano.firstChild.textContent = display;
        piano.piano.previousArray = displayArr;
        // piano.dataset.val++;
        if (piano.dataset.val) {
            var val = parseInt(piano.dataset.val, 10);
            val++;
            piano.dataset.val = val.toString(10);
            if (parseInt(piano.dataset.val, 10) == piano.piano.max) {
                piano.dataset.val = "0";
            }
        }
    }
}
function makePianoDisplayString(piano) {
    var count = piano.dataset.val;
    if (count) {
        var countString = (+count).toString(piano.piano.base);
        var zeroPadding = piano.piano.padding.substring(0, piano.piano.padding.length - countString.length);
        return zeroPadding + countString;
    }
    return "";
}
function setPianosInURL() {
    var URLString = encodePianos();
    history.replaceState({}, "", "?".concat(URLString));
}
function encodePianos() {
    var URLString = "";
    for (var _i = 0, _a = uiState.pianos; _i < _a.length; _i++) {
        var piano = _a[_i];
        // for (let i = 0; i < uiState.pianos.length; i++) {
        //   let piano = uiState.pianos[i];
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
function decodePianosFromURL(queryString) {
    if (!isValidQueryString(queryString)) {
        console.log("invalid query string: ", queryString);
        console.log("defaulting to 1 piano with base 2");
        addPiano(2);
        return;
    }
    console.log("valid query string: ", queryString);
    var entries = new URLSearchParams(queryString).entries();
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var property = entries_1[_i];
        if (property[0] === "base") {
            var pianoDiv = addPiano(parseInt(property[1], 10));
            var notes = entries.next().value[1];
            pianoDiv.piano.notes = notes.replace(/\^/g, "#").split(" ");
        }
    }
    updateKeyboardUI();
}
function isValidQueryString(queryString) {
    var rePattern = /((base=([2-9]|10))\&(notes=([A-G]\^?[0-7]\+){2,9}([A-G]\^?[0-7]))\&)+/;
    if (queryString.match(rePattern)) {
        return true;
    }
    else {
        return false;
    }
}
window.onload = function () {
    // Tone.Context().resume();
    decodePianosFromURL(getQueryString());
    bindUI();
};
