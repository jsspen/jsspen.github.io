---
layout: page.njk
title: sumStrings
eleventyNavigation:
    key: sumStrings
    parent: JavaScript Katas
---

**Source:** [Codewars](https://www.codewars.com/kata/5324945e2ece5e1f32000370)

**The Challenge:** Given the string representations of two integers, return the string representation of the sum of those integers.
A string representation of an integer will contain no characters besides the ten numerals "0" to "9". I have removed the use of BigInteger and BigDecimal.

```js
function sumStrings(a, b) {
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
    } else if (total >= 10) {
      sum = (total % 10) + sum;
      carried = 1;
    }
  }
  sum = carried === 1 ? 1 + sum : sum;
  for (let x = 0; x < sum.length; x++) {
    if (sum.charAt(x) === "0") {
      sum = sum.substring(x + 1);
    } else {
      return sum;
    }
  }
}
```
