"use strict";

// there can be multiple "keyboards"
// each keyboard has data: a radix, current count

// counts from 0 til base^9
function count() {
  let numbers = document.getElementsByClassName("number");
  let base = 5;
  let limit = base ** 9;
  let str = "0";
  for (let i = 0; i < limit; i++) {
    create a closure to preserve the value of "i"
    (function (i) {
      window.setTimeout(function () {
    str = i.toString(base);
    numbers[0].innerHTML = str;
        }, 1000);
      })(i);
  }
}

count();
