"use strict";
// there can be multiple "keyboards"
// each keyboard has data: a radix, current count

var number = document.getElementById("number");

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

startButton.addEventListener("click", () => {
  let synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      partials: [0, 2, 3, 4],
    },
  }).toDestination();

  Tone.Transport.bpm.value = 50;
  //play a note every eighth note starting from the first measure
  Tone.Transport.scheduleRepeat(
    function (time) {
      // play a chord
      synth.triggerAttackRelease(["C4", "E4", "A4"], 0.4, time);
      number.dataset.val++;

      number.innerHTML = (number.dataset.val >>> 0).toString(2);
    },
    "8n",
    "1m",
  );
  Tone.Transport.start();
});

stopButton.addEventListener("click", () => {
  Tone.Transport.stop();
});
