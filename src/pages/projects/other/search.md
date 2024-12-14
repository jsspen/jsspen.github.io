---
layout: page.njk
title: Search Automation | Jordan Spencer
eleventyNavigation:
    key: Search Automation
    parent: Other Coding Examples
---

# Automating the Boring Stuff

**Ingredients:** JavaScript, Browser Userscripting, Python, Excel

Job hunting can be a real slog but sometimes 5 minutes of code can provide a simple solution to at least a little bit of the work. Here's an example. This isn't anything particularly complex but I've included it here as it's an example of how I've been approaching things lately and my thought process at the time of problem solving.

## Manipulating the Web with Userscripts

I came across a list of remote-friendly companies and I thought it would be a good idea to make my way down the list checking for openings.

My first thought was just to copy the list into a new page of my trusty Job Hunting Spreadsheet. Though the list was only ~200 lines it quickly froze up when I tried to drop it in. After a few minutes of waiting I saw why: it had included every company logo from the first column and some were **huge**! I fiddled a bit to see if there was a quick way to delete the images and retain the text but things were a mess. I tried using the text-import dialogue to paste only the text but then the formatting was a single-column disaster.

One of my favorite things to play with lately is browser userscripts. After a quick peek at the list page's HTML, I wrote a quick script in ViolentMonkey to find and delete all the `div` tags with a class of `company-icon`.

```js
// ==UserScript==
// @name        No logos on levels.fyi list
// @namespace   Violentmonkey Scripts
// @match       http*://*levels.fyi/remote/*
// @grant       none
// @version     1.0
// @author      jsspen
// @description Removes all company logos from page
// ==/UserScript==
(function() {
    'use strict';
    // Select all divs with class company-icon
    let iconDivs = document.querySelectorAll("div[class='company-icon']");
    // Loop through each div and remove it
    iconDivs.forEach(div => div.remove());
})();
```

## Automated Searching with Python and the DuckDuckGo API

After a refresh of the page: no more icons and I could copy the list into my spreadsheet without issue. But then I started thinking about how much of a pain it was going to be to search for each company on my new list (the original page didn't include any links!) and it would be so nice to automate that part. I remembered that DuckDuckGo offers a free search API and after a quick look around I found a Python package (`duckduckgo-search`) that simplifies interacting with the API.

So I wrote a quick script that took in an array of strings (*company names with some find-and-replace magic to add the necessary quotes and commas to the raw text*) looped through the entries and interpolated each into a simple query string (`q=f"{company} careers page"`), limited the returned data to only the first result, parsed the returned data for the URL (`result[0]['href']`) and saved that along with the company name into a new row in a csv output file. A quick `time.sleep(2)` in the loop after each search slowed things down enough to avoid being rate limited.

```Python
import time
from duckduckgo_search import DDGS

companies = ["Airbnb","Dropbox","Pinterest"]

with open(f"companies_and_career_pages.csv", "w", encoding="utf-8") as file:
    for company in companies:
        result = DDGS().text(f"{company} careers page", max_results=1)
        csv_line = company + "," + (result[0]['href'] or ' ') + "\n"
        file.write(csv_line)
        time.sleep(2)
```

Once the script was finished I dropped my new csv list into my spreadsheet. *But the URLs weren't clickable!* So for a final shortcut I added a new formula column with `=HYPERLINK({url cell},{name cell})` and just like that I had a nice column of clickable links to each company's careers page!

P.S. For those like me who wonder if it's possible to add the formula directly to the output file, it seems LibreOffice Calc doesn't like when you aren't writing formulas in Calc itself, so outputting files with formatting like: {𝘤𝘰𝘮𝘱𝘢𝘯𝘺},{𝘶𝘳𝘭},=𝘏𝘠𝘗𝘌𝘙𝘓𝘐𝘕𝘒(𝘉{𝘪𝘥𝘹},𝘈{𝘪𝘥𝘹}) and =𝘏𝘠𝘗𝘌𝘙𝘓𝘐𝘕𝘒("𝘩𝘵𝘵𝘱𝘴://𝘳𝘰𝘢𝘥𝘮𝘢𝘱.𝘴𝘩/𝘥𝘢𝘵𝘢-𝘢𝘯𝘢𝘭𝘺𝘴𝘵", "𝘙𝘰𝘢𝘥𝘮𝘢𝘱") unfortunately just results in plain text.
