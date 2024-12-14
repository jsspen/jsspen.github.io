---
layout: page.njk
title: noBigInt
eleventyNavigation:
    key: noBigInt
    parent: JavaScript Katas
---

**Source:** [Codewars](https://www.codewars.com/kata/525f4206b73515bffb000b21)

**The Challenge:** Write a function that returns the sum of two numbers. The input numbers are strings and the function must return a string. NOTE: The input numbers are big. The input is a string of only digits. The numbers are positives You cannot use BigInt!

```js
function add(a, b) {
  arrayA = a.split("");
  arrayB = b.split("");

  top = arrayA.length >= arrayB.length ? arrayA : arrayB;
  bottom = arrayB.length <= arrayA.length ? arrayB : arrayA;
  diff = top.length - bottom.length;
  bottom.unshift(...new Array(diff).fill("0"));

  let sum = "";
  let carried = 0;

  for (let x = top.length - 1; x >= 0; x--) {
    total = Number(top[x]) + Number(bottom[x]) + carried;
    if (total < 10) {
      sum = total + sum;
      carried = 0;
    }
    if (total >= 10) {
      sum = (total % 10) + sum;
      carried = 1;
    }
  }
  return carried === 1 ? 1 + sum : sum;
}
```
