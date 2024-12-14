---
layout: page.njk
title: ISSU Grabber | Jordan Spencer
eleventyNavigation:
    key: ISSU Grabber
    parent: Other Coding Examples
---

# ISSUU Grabber

[Github Repo](https://github.com/jsspen/issuu-grabber)

An interactive Python script to scrape, build, and save a PDF copy of any document hosted by ISSUU

**Ingredients:** Python, File I/O, File Conversion, HTTP Requests, Web Scraping, BeautifulSoup, HTML Parsing

---

## Basic usage

- Clone or download repo
- Open terminal in root directory
- Run the program with `python issuu-grabber.py`

### Manual Entry

Provide a single URL with the option to continue as many times as desired

- When prompted enter `u` for manual entry
- Paste the full ISSUU URL into the terminal

### File Entry

Simple batch processing for a list of URLs

- When prompted enter `f` for file input
- Input file should be named `input.txt`
- File should be saved in the app root directory
- File should contain one URL on each line

## Source Code

```python
import json
import os
import shutil
import sys
import time

import img2pdf
import requests
from bs4 import BeautifulSoup

mode = input('Single URL (u) or file input (f)? ')
keep_going = True
input_list = []
proceed = ''

while keep_going:
    if mode == 'u':
        input_list = [input('What is the URL? ')]

    elif mode == 'f':
        input_file = open('input.txt', 'r')
        file_data = input_file.read()
        input_list = file_data.split('\n')

    for url in input_list:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
                          'Chrome/96.0.4664.110 Safari/537.36',
            'Accept': 'text/html'
        }
        url_response = requests.get(url, headers=headers)
        if url_response.status_code != 200:
            print('Failed to fetch webpage')
            # Uncomment any/all of the below lines for help troubleshooting fetch failure
            # print('Response Status Code: ', url_response.status_code)
            # print('Response Content: ', url_response.text)
            # print('Final URL after redirects: ', url_response.url)
            # print('Request Headers: ', url_response.request.headers)
        else:
            soup = BeautifulSoup(url_response.content, 'html.parser')
            initial_data = soup.find('script', id='initial-data')
            if initial_data is None:
                print('initial-data script tag not found')
            json_data = json.loads(initial_data['data-json'])
            revision_id = json_data['initialDocumentData']['document']['revisionId']
            publication_id = json_data['initialDocumentData']['document']['publicationId']
            title = json_data['initialDocumentData']['document']['title']
            total_pages = int(json_data['initialDocumentData']['document']['pageCount'])
            base_url = f'https://image.isu.pub/{revision_id}-{publication_id}/jpg/page_'
            if not os.path.exists(title):
                os.makedirs(title)
            print(f'Processing {title}: ', end=' ')
            for page in range(1, total_pages + 1):
                img_response = requests.get(base_url + str(page) + '.jpg')
                if img_response.status_code == 200:
                    with open(f'{title}/{page}.jpg', 'wb') as file:
                        file.write(img_response.content)
                        if page == total_pages:
                            print('.')
                        else:
                            print('.', end=' ')
                else:
                    print(f'failed to download page {page}')
            images = []
            for file_name in sorted(os.listdir(title), key=lambda x: int(os.path.splitext(x)[0])):
                # for file_name in os.listdir(title):
                if not file_name.endswith('.jpg'):
                    continue
                img_path = os.path.join(title, file_name)
                if os.path.isdir(img_path):
                    continue
                images.append(img_path)
            if not os.path.exists('completed'):
                os.makedirs('completed')
            with open(f'completed/{title}.pdf', 'wb') as file:
                file.write(img2pdf.convert(images))
                try:
                    shutil.rmtree(title)
                except OSError as e:
                    print('Error: %s : %s' % (file, e.strerror))
        if mode == "f":
            keep_going = False
        if mode == "u":
            proceed = input('Do you have another document to process? (y or n) ')
            if proceed == 'n':
                keep_going = False
print("Completed.")
time.sleep(3)  # Pause for 3 seconds
sys.exit()
```
