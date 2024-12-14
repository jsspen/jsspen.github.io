---
layout: page.njk
title: sumIntervals | Jordan Spencer
eleventyNavigation:
    key: sumIntervals
    parent: JavaScript Katas
---

**Source:** [Codewars](https://www.codewars.com/kata/52b7ed099cdc285c300001cd)

**The Challenge:** Write a function that accepts an array of intervals, and returns the sum of all the interval lengths. Overlapping intervals should only be counted once. Intervals are represented by a pair of integers in the form of an array. The first value of the interval will always be less than the second value.

```js
function sumIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  let sum = 0;
  let compositeIntervals = [[intervals[0][0], intervals[0][1]]];
  for (let x = 0; x + 1 < intervals.length; x++) {
    let y = x + 1;
    let ceiling = intervals[x][1];

    let x0 = compositeIntervals[compositeIntervals.length - 1][0];
    let x1 = compositeIntervals[compositeIntervals.length - 1][1];
    let y0 = intervals[y][0];
    let y1 = intervals[y][1];
    if (y0 <= x1) {
      ceiling = x1 >= y1 ? x1 : y1;
      compositeIntervals[compositeIntervals.length - 1][1]
        = ceiling;
    } else if (y0 > x0 && y0 > x1 && y1 > x1) {
      compositeIntervals.push([y0, y1]);
    }
  }
  for (let x = 0; x < compositeIntervals.length; x++) {
    sum = sum + (compositeIntervals[x][1] - 
      compositeIntervals[x][0]);
  }
  return sum;
}
```
