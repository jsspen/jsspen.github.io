---
layout: page.njk
title: No More DTS | Jordan Spencer
eleventyNavigation:
    key: No More DTS
    parent: Other Coding Examples
---

# NoMoreDTS
[GitHub Repo](https://github.com/jsspen/NoMoreDTS)

An interactive CLI program to handle audio conversion of video files with FFMPEG

**Ingredients:** Python, FFMPEG, File I/O, File Conversion

_*Why?*_ I have a television that cannot direct play DTS encoded audio (or FLAC) and my little Raspberry Pi can get really bogged down trying to transcode audio on the fly. I had previously encoded many of my files with DTS audio without realizing the limitations of my (admittedly quite old) TV. I've got years with of archived video and when I go to watch something and my media player shows "DTS Audio" my whole family groans. There's nothing at all wrong with DTS (or FLAC) and I wish I could play them... but for now I need to convert them.

---

## Basic usage

- Clone or download repo
- Open terminal in root directory
- Update base path values in the code
- Run the program with `python NoMoreDTS.py`

### Manual Entry

Provide the necessary information to process a single file. This option also allows for customizing the base path and the FFMPEG command used for processing.

- When prompted enter `m` for manual entry
- Default base paths are hardcoded on lines 34 & 35, make sure to update these with the relevant values for your useage.
- Provide a destination path, meaning the name of the directory where the converted file should be saved. This will be combined with the `OUTPUT_BASE` (whether pre-defined or set during run) to ensure the directory exists before the conversion process begins.
- Provide the input path, including file extension. This will be combined with the `INPUT_BASE` (whether pre-defined or set during run) to create the full input path passed to FFMPEG. If the `INPUT_BASE` value is set to the root directory of the file then only the filename and extension need to be entered here but it will also accept any amount of nested directories, too.
- Provide the output filename desired.
- Decide on using the default FFMPEG command or something else
- Process!

### File Entry

A CSV file can be passed to process multiple files

- When prompted enter `c` for file input
- File should be saved in the app root directory
- Program expects the first row of the file to be a labeled header row with the three columns: `OUTPUT_DIRECTORY`, `INPUT_FILE_PATH`, and `OUTPUT_FILENAME`.
- This will always process the files using the same FFMPEG command, though you are given the option to use a custom command.

## Source Code

```python
import os
import subprocess
import csv

# create directory if it doesn't exist
def create_directory(path):
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Created directory: {path}")
    else:
        print(f"Directory already exists: {path}")

# run the ffmpeg command
def run_ffmpeg(INPUT_PATH, FULL_OUTPUT, FFMPEG_COMMAND):
    command = [
        "ffmpeg",
        "-i", INPUT_PATH,
        *FFMPEG_COMMAND.split(),
        FULL_OUTPUT
    ]
    try:
        subprocess.run(command, check=True)
        print(f"Conversion successful! File saved at: {FULL_OUTPUT}")
    except subprocess.CalledProcessError as e:
        print(f"Error during conversion: {e}")

# take user input rather than csv file
def manual_input():
    # Manual input mode
    USE_DEFAULT_PATHS = input('Do you want to use the default base paths? (y/n) ')

    if USE_DEFAULT_PATHS == 'y':
        # set by default
        INPUT_BASE = '/hardcoded/path/to/input/'
        OUTPUT_BASE = '/hardcoded/path/to/destination/'
        # file specific input
        OUTPUT_DIRECTORY = input(f'Destination path: {OUTPUT_BASE}')
        INPUT_FILE_PATH = input(f'Current path (including extension): {INPUT_BASE}')
        OUTPUT_FILENAME = input('Output filename? ')
        # combining default & input
        # output base + output directory = path for creating output directory if it doesn't exist
        OUTPUT_PATH = f"{OUTPUT_BASE}{OUTPUT_DIRECTORY}"
        # input base + input path = ffmpeg input
        INPUT_PATH = f"{INPUT_BASE}{INPUT_FILE_PATH}"
        # output path + output filename = ffmpeg output
        FULL_OUTPUT = f"{OUTPUT_PATH}/{OUTPUT_FILENAME}"
        # check
        print(f'Creating: {OUTPUT_PATH}')
        print(f'Processing: {INPUT_PATH}')
        print(f'Outputting: {FULL_OUTPUT}')
        ####### TO DO #######
        # correct = input('Is this correct?')
    else:
        OUTPUT_PATH = input('Enter the full path for the final destination directory: ')
        INPUT_PATH = input('Enter the full path for the current file, including extension: ')
        OUTPUT_FILENAME = input('What is the desired final filename? ')
        FULL_OUTPUT = f"{OUTPUT_PATH}/{OUTPUT_FILENAME}"
        print(f'Creating: {OUTPUT_PATH}')
        print(f'Processing: {INPUT_PATH}')
        print(f'Outputting: {FULL_OUTPUT}')
        ####### TO DO #######
        # correct = input('Is this correct?')

    # Give option to change command or use default
    FFMPEG_COMMAND = set_FFMPEG_COMMAND()
    # FFMPEG doesn't like if the output directory doesn't exist yet
    create_directory(OUTPUT_PATH)
    # Run the ffmpeg conversion
    run_ffmpeg(INPUT_PATH, FULL_OUTPUT, FFMPEG_COMMAND)

# Take a csv file as input
# currently accepts header row with
# OUTPUT_DIRECTORY, INPUT_FILE_PATH, OUTPUT_FILENAME
def csv_input():
    CSV_FILE = input('Enter the name of the CSV file: ')
    # Get command outside of the loop so you don't have to keep answering
    # Assumes you're going to use the same command for batch processing
    FFMPEG_COMMAND = set_FFMPEG_COMMAND()
    try:
        with open(CSV_FILE, mode='r') as file:
            reader = csv.reader(file)
            # Skip first (header) row
            next(reader, None)
            for row in reader:
                OUTPUT_DIRECTORY, INPUT_FILE_PATH, OUTPUT_FILENAME = row
                # Currently using a default base path
                OUTPUT_PATH = f"/hardcoded/path/to/destination/{OUTPUT_DIRECTORY}"
                INPUT_PATH = f"/hardcoded/path/to/input/{INPUT_FILE_PATH}"
                FULL_OUTPUT = f"{OUTPUT_PATH}/{OUTPUT_FILENAME}"

                # Create destination directory
                create_directory(OUTPUT_PATH)
                # Run the ffmpeg conversion
                run_ffmpeg(INPUT_PATH, FULL_OUTPUT, FFMPEG_COMMAND)

    except FileNotFoundError:
        print(f"Error: CSV file '{CSV_FILE}' not found.")

def set_FFMPEG_COMMAND():
    FFMPEG_COMMAND = "-map 0 -c:v copy -c:a ac3 -b:a 640k -c:s copy"
    USE_DEFAULT_COMMAND = input(f'Do you want to use the default command: {FFMPEG_COMMAND}? (y/n) ')
    if USE_DEFAULT_COMMAND != 'y':
        FFMPEG_COMMAND = input('Enter the desired command: ')
    return FFMPEG_COMMAND

# Select input type
# csv file must be in root directory
INPUT_TYPE = input(f'Enter \'c\' for csv input or \'m\' for manual: ')
if INPUT_TYPE == 'c':
    csv_input()
if INPUT_TYPE == 'm':
    manual_input()

```
