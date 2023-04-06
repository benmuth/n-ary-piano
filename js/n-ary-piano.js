// import * as Tone from "tone";

// "use strict";
// there can be multiple "keyboards"
// each keyboard has data: a radix, current count

// counts from 0 til base^9
// console.log(1);
// document.querySelector("button").addEventListener("click", async () => {
//   await Tone.start();
// });

// window.onclick = new AudioContext();
// let synth = new Tone.PolySynth().toDestination();

addEventListener("click", (event) => {
  const synth = new Tone.PolySynth().toDestination();
  // set the attributes across all the voices using 'set'
  synth.set({ detune: -1200 });
  // play a chord
  synth.triggerAttackRelease(["C4", "E4", "A4"], 1);
});

// console.log(synth.get);

// piano({
//   parent: document.querySelector("#number"),
//   polyphonic: true,
//   noteon: (note) => synth.triggerAttack(note.name),
//   noteoff: (note) => synth.triggerRelease(note.name),
// });

// ui({
//   tone: synth,
//   parent: document.querySelector("#number"),
// });
// console.log(2);
// function count() {
//   let numbers = document.getElementsByClassName("number");
//   let base = 5;
//   let limit = base ** 9;
//   let str = "0";

//   const synth = new Tone.PolySynth(8, Tone.Synth, {
//     oscillator: {
//       partials: [0, 2, 3, 4],
//     },
//   });
//   // console.log(synth.getOwnPropertyNames());
//   synth.toDestination();
//   Tone.Transport.bpm.value = 50;
//   console.log(Tone.Transport);
//   Tone.Transport.scheduleRepeat((time) => {
//     for (let i = 0; i < limit; i++) {
//       // create a closure to preserve the value of "i"
//       str = i.toString(base);
//       numbers[0].innerHTML = str;
//       synth.triggerAttackRelease("Bb4", 2, time);
//     }
//   });
//   Tone.Transport.start();
// }

// console.log(3);
// count();
