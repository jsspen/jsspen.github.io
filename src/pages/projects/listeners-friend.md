---
layout: page.njk
title: LISTener's Friend
eleventyNavigation:
    key: LISTener's Friend
    parent: Projects
---

# LISTener's Friend

[Github Repo](https://github.com/jsspen/listeners-friend)

A flexible, interactive program that converts album lists to Spotify playlists

**Ingredients:** Python, API, OAuth, Recursion, File I/O, Web Scraping, Selenium, Headless-Chrome, BeautifulSoup, HTML Parsing

_Below you will find the current contents of the project README to which I've added some snippets of the relevant code. If you would like a closer look at the program and how it is written please take a look at the repo linked above._

---

_**Why?**_ When exploring new music I've always preferred listening to albums rather than "top" tracks or algorithmically generated playlists. The problem is that building playlists manually, say from a list like [this](https://rateyourmusic.com/list/funks/the_wires_100_most_important_records_ever_made/), takes a lot of copy-paste-searching and click-n-dragging, so I built this to make the process faster and easier.

## Getting Started

1. Clone or download a copy of this repo.
2. Install the required dependencies: `pip install python-dotenv spotipy selenium bs4`
3. Rename the included `example.env` to `.env`, change the default input file path if desired, and update with your API credentials.
4. Run the program: `python listeners_friend.py`
5. Select type of input source from given options
   - Option 1: Add a list of albums in the format `artist - album`, each on a new line, to `input.txt`
   - Option 2, 6, 8: Provide a URL for supported source
   - Options 3, 4: No user input needed, fully automated
   - Options 5, 7: Interactive user input selection
6. A new playlist will be created directly in your Spotify account, ready to play!

## How It Works

### Basics

- User is authenticated with the Spotify API, either using the API credentials stored in the `.env` file or an existing token stored in the `.cache` file
- The chosen data source is read and the necessary information is parsed into an array of tuples in the form `[(artist, album)]` which serves as the finalized input
- A playlist name and description are either provided by the user (op. 1), taken directly from the data source (op. 2), or auto-generated (op. 3)
- The finalized input is looped through and the Spotify library is queried for each entry with `q="album:{album} artist:{artist}"` limited to the album data type with a maximum result quantity of 1 so that only the top matching result (if any) is grabbed
- The album match data is parsed for its URI string
- Albums which are't found are added to a separate list
- The API is again queried using the album URI to fetch the tracklist data
- Tracklist data is parsed for each individual track's URI
- Once tracks have been gathered for every album URI, a count is taken of the albums not found and this is prepended to the playlist description in the form `"### {albums or tracks} not found.`
- A text file is saved to the current directory which contains the `artist - {album or track}` info for each album or track not found
- The necessary info is sent to the user's account for the creation of a new playlist and its ID is retrieved
- Track URIs are posted to the new playlist

```Python
// utils.py
# Print number of missing items to file and prepend basic info to playlist description
def handle_missing(missing, playlist_name, playlist_description, type):
    clean_playlist_name = re.sub(r"[/\\?%*:|\"<>\x7F\x00-\x1F]", "-", playlist_name)
    with open(f"not_found_for_{clean_playlist_name}_{today}.txt", "w", encoding="utf-8") as file:
            file.write("Not Found:\n")
            for item in missing:
                file.write(item + "\n")
    if (len(missing) > 1):
        type = type + "s";
    playlist_description = str(len(missing)) + f" {type} not found. " + playlist_description
    print(f"Info on missing {type} saved to text file in directory...")
    return playlist_description

def album_search(playlist_name, playlist_description, input_list, spotify):
    # Search for each album
    print("Searching Spotify library for albums...")
    for artist, album in input_list:
        # album specific search using Spotify's "album:{query}" format
        # returns only the top result
        result = spotify.search(q='album:' + album + ' artist:' + artist, type="album", limit=1)
        if result['albums']['items']:
            album_uris.append(result['albums']['items'][0]['uri'])
        else:
            missing.append(artist + " - " + album)

    if len(missing) > 0:
        print(f"{len(missing)} albums weren't found...")
        playlist_description = handle_missing(missing, playlist_name, playlist_description, "album")
        
    track_uris = track_search(spotify, album_uris)
    return track_uris, playlist_description, (len(input_list) - len(missing))

# Take album URIs and return track URIs
def track_search(spotify, album_uris = None, track_input = None, playlist_name = None, playlist_description = None):
    if album_uris:
        print("Searching for associated tracks...")
        # Get the tracks for each album URI
        for album in album_uris:
            tracks = spotify.album_tracks(album)['items']
            # Get the URIs for each track
            for track in tracks:
                track_uris.append(track['uri'])
        print(f"{len(album_uris)} albums have been converted to {len(track_uris)} tracks...")
        return track_uris
    elif track_input:
        print("Searching Spotify library for tracks...")
        for track in track_input:
            artist, title = track
            result = spotify.search(q=f"artist:{artist} track:{title}", type="track", limit=1)
            if result['tracks']['items']:
                uri = result['tracks']['items'][0]['uri']
                if uri:
                    track_uris.append(uri)
            else:
                missing.append(artist + " - " + title)
        if len(missing) > 0:
            print(f"{len(missing)} tracks weren't found...")
            playlist_description = handle_missing(missing, playlist_name, playlist_description, "track")
        return track_uris, playlist_description

# Check if track_uris > 11,000 (the max playlist size) and split into two playlists if so
# You don't need more than two... right? 22,000 tracks seems like an OK maximum
def giant_check(track_uris, playlist_description, playlist_name, spotify):
    overflow_track_uris = []
    print('Uh oh, this list is too big to contain in a single playlist!')
    print(f"Splitting {len(track_uris)} tracks in two...")
    overflow_track_uris = track_uris[11000:]
    max_track_uris = track_uris[:11000]
    overflow_playlist_name = playlist_name + " (Part 2)"
    playlist_name = playlist_name + " (Part 1)"
    print(f"Creating {playlist_name}, which contains 11,000 tracks")
    create_playlist(max_track_uris, playlist_description, playlist_name, spotify)
    print(f"Creating {overflow_playlist_name}, which contains {len(overflow_track_uris)} tracks")
    create_playlist(overflow_track_uris, playlist_description, overflow_playlist_name, spotify)
    

# Break potentially huge list of tracks into easily manageable chunks
def chunk_list(lst, chunk_size):
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]

# Take track URIs and final playlist title & description
def create_playlist(track_uris, playlist_description, playlist_name, spotify):
    # Split into two playlists if maximum track count is hit
    if len(track_uris) > 11000:
        track_uris = giant_check(track_uris, playlist_description, playlist_name, spotify)
    user_id = spotify.current_user()["id"]
    if track_uris:
        playlist = spotify.user_playlist_create(user_id, playlist_name, public=True, description=playlist_description)
        print(f"Playlist {playlist_name} has been created...")
        track_uris = [uri for uri in track_uris if uri is not None]

        # Split to chunks of 100 tracks, the max allowed by the API in a single post
        for chunk in chunk_list(track_uris, 100):
            try:
                spotify.playlist_add_items(playlist['id'], chunk)
            except spotipy.exceptions.SpotifyException as e:
                print(f"An error occurred: {e}")
    else:
        print("List of track URIs is empty, nothing added to playlist.")
```

_**Spotify API Limitations**_

- Only individual tracks or podcast episodes, not albums, can be added to playlists, so this is why URIs for each individual track on an album are collected rather than just posting the album URI to the playlist
- Only 100 tracks can be posted to a playlist at a time so large lists of track URIs are broken into chunks of 100 or less before being sent
- A Spotify playlist can have a maximum of 11,000 tracks, which you can certainly run up against if using a huge RYM list, and in those cases two playlists will be created `{playlist name} (Part 1)` with the first 11,000 tracks and `{playlist name} (Part 2)` with the overflow.

### Authorization

_It is necessary to have Spotify API credentials stored in the `.env` file. If you need help, see the [guide](#how-to-get-spotify-api-credentials) at the end of this doc for details._

The first time you run the program you'll be sent to a Spotify authorization page in your browser. It should be asking you if you want to allow connecting to { _whatever you named your app when getting your API credentails_ }. After this you'll be routed to your Redirect URI. Copy the <u>full</u> URL and paste it into the command prompt to finalize authorization. Your OAuth token will be stored in the `.cache` file.

```Python
from dotenv import load_dotenv

import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

spotify = spotipy.Spotify(auth_manager=SpotifyOAuth(
   client_id=os.getenv("SPOTIPY_CLIENT_ID"),
   client_secret=os.getenv("SPOTIPY_CLIENT_SECRET"),
   redirect_uri=os.getenv("SPOTIPY_REDIRECT_URI"),
   scope="playlist-modify-public"
))
```

### Options

```Python
// utils.py
def display_options(options):
    # Check if this is just a bunch of strings to print or something more complex
    if type(options[0]) == str:
        for idx, option in enumerate(options, start=1):
            print(f"{idx}. {option}")
    # Right now this is just for displaying lists of NTS Episodes
    else:
        for idx, option in enumerate(options, start=1):
            tags = " #".join(f"{option['tags'][i]}" for i in range(len(option["tags"])))
            print(f"{idx}. {option['date']} {option['title']}, {option['location']} #{tags}")
        
def get_user_selection(options):
    while True:
        display_options(options)
        try:
            print()
            selected_option = int(input("Please select an option: "))
            if 1 <= selected_option <= len(options):
                return selected_option
            else:
                print(f"Invalid selection. Please choose a number between 1 and {len(options)}.")
        except ValueError:
            print("Invalid input. Please enter a number.")
```

#### Option 1: Use txt file

- Filepath is read from the `.env` file, default is `./input.txt`
- Input in the form of `artist - album \n` is parsed from the text file into the finalized input array
- User is prompted to enter a _name_ and an (optional) _description_ for the new playlist

```Python
//main.py
if selected_option == 1:
   with open(os.getenv("INPUT_PATH"), "r") as file:
      input_list = [tuple(line.strip().split(" - ", 1)) for line in file if line.strip()]
      playlist_name = input("Enter playlist name: ")
      playlist_description = input("Enter playlist description: ")

// ... snip ...

if output_type == 'albums':  
   print("Creating an album-based playlist")
   track_uris, playlist_description, count = album_search(playlist_name, playlist_description, input_list, spotify)

// ... snip ...

create_playlist(track_uris, playlist_description, playlist_name, spotify)
   print(f"Playlist \"{playlist_name}\" has been successfully created!")
   if output_type == 'tracks':
      print(f"It contains {len(track_uris)} tracks!")
   elif output_type == 'albums':
      print(f"It contains {count} albums for a total of {len(track_uris)} tracks!")
   print(f"Get to listening!")
```

#### Options 2-8: Scraped Web Data Input

Lists hosted on supported websites can be scraped using Selenium and BeautifulSoup to build the finalized input array

```Python
//scraper.py

import os
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

load_dotenv()

def get_soup(url):
    print("Fetching data...")
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument(f"user-agent={os.getenv('USER_AGENT')}")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=Service(), options=chrome_options)
    driver.get(url)
    html = driver.page_source
    driver.quit()

    return BeautifulSoup(html, 'html.parser')
```

_If you are running the program in Bash you may have difficulty entering a URL for options 2 or 8!_

##### Option 2: Use RateYourMusic List URL

- The URL for a list at [RateYourMusic](https://rateyourmusic.com/lists/) can be supplied as an input source
- Playlist name is automatically set to the name of the list and description is set to the list description (truncated if it runs beyond Spotify's 300 character limit)
- The program will iterate through multi-page lists _but_ you may experience a premature end due to RYM's use of the occasional random CloudFlare captcha
  - A way to circumvent this is tba, for now just retry or pass in the URL of the page where it stopped

```Python
// option_handlers.py
def handle_rym_list(soup):
    global page
    print(f"Processing page {str(page)}...")
    playlist_name = soup.find('h1').get_text(strip=True)
    playlist_description = soup.find('span', class_='rendered_text')
    if playlist_description is None:
        playlist_description = ''
    else:
        playlist_description = playlist_description.get_text(strip=True)
    # Truncate long descriptions to fit within Spotify's 300 character limit
    # Also taking into consideration the 19-21 chars of "### items not found. " prepended later
    playlist_description = (playlist_description[:276] + '...') if len(playlist_description) > 279 else playlist_description
    
    has_next_page = False
    next_url = None
    
    nav_div = soup.find('div', id='nav_bottom')
    if nav_div:
        nav_span = nav_div.find('span', class_='navspan')
        if nav_span:
            navlink_next = nav_span.find('a', class_='navlinknext')
            if navlink_next:
                next_url = navlink_next['href']
                if next_url:
                    next_url = "https://rateyourmusic.com" + next_url
                    has_next_page = True
        
    list = soup.find('table', id='user_list')
    if list is None:
        print("List not found on page {page}, potential captcha block")
    else: 
        for row in list.find_all('tr'):
            artist_tag = row.find('a', class_='list_artist')
            album_tag = row.find('a', class_='list_album')
            if not artist_tag or not album_tag:
                continue
            artist = artist_tag.get_text(strip=True)
            album = album_tag.get_text(strip=True)
            input_list.append((artist, album))
    if has_next_page == True:
        page = page + 1
        next_bowl_of_soup = get_soup(next_url)
        handle_rym_list(next_bowl_of_soup)
    return playlist_name, playlist_description, input_list
```

##### Option 3: Use Current Boomkat Bestsellers List

- The [Boomkat Bestsellers](https://boomkat.com/bestsellers?q[release_date]=last-week) list is used as input source
- Playlist name is automatically set to `Boomkat Bestsellers` and the description is set to `For the week ending YYYY-MM-DD`, where date is the day the data was gathered
- Timespan default is one week but can be changed by modifying the (hardcoded) source URL `https://boomkat.com/bestsellers?q[release_date]=last-week` where `last-week` can be replaced with `last-month` or `last-year`.

```Python
// option_handlers.py
def handle_boomkat(soup):
    print(f"Processing Boomkat Bestsellers list for the week ending {today}...")
    table = soup.find('div', class_='bestsellers')
    if table is None:
        print("Table not found")
    bestsellers_list = table.find('ol', class_='bestsellers-list')
    if bestsellers_list is None:
        print("List not found")
    else: 
        for item in bestsellers_list.find_all('li', class_='bestsellers-item'):
            artist = item.find('div', class_='product-name').find_all('a')[0].text.strip().title()
            album = item.find('div', class_='product-name').find_all('a')[1].text.strip()
            input_list.append((artist, album))
    playlist_name = "This Week's Boomkat Bestsellers"
    playlist_description = "For the week ending " + today
    return playlist_name, playlist_description, input_list
```

##### Option 4: Use Current Forced Exposure Bestsellers List

- The [Forced Exposure Bestsellers](https://forcedexposure.com/Best/BestIndex.html) list is used as input source
- Playlist name is automatically set to `Forced Exposure Bestsellers` and the description is set to `As of YYYY-MM-DD`, where date is the day the data was gathered
- Forced Exposure doesn't offer any alternate timespans and it's not clear how often the list is updated

_(Code to handle this is conceptually the same as the above Boomkat list handler with modifications to handle the differing page structure)_

##### Options 5 & 6: Browse and Select from WFMU's "Heavy Play" Archive

- Browse the [WFMU "Heavy Play" archive](https://www.wfmu.org/Playlists/Wfmu/) by date
- Provide a year and receive a list of dated lists to select as an input source
  - Current Limitations:
    - 1987-1996 lists are only available as PDF downloads
    - 1997 to late 2018 vary in format and structure and have inconsistent support at the moment
- Generates a playlist name `WFMU Heavy Play {Month DD, YYYY}` and a description `{#} albums not found.`
- Option 6 offers the ability to skip the browsing and provide a list URL directly (date limitations still apply!)

_These can be pretty huge (as in a few thousand songs) so they take a little longer to build than other options and the playlists themselves can be a little slow in your Spotify client!_

```Python
// options_handlers.py
def handle_wfmu_latest(soup):
    
    year = input("For what year (2014-present): ")
    print("Select a date: ")
    
    # List available dates for selected year as YYYY-MM-DD
    for a_tag in soup.find_all("a", class_="playlist"):
        href = a_tag.get("href")
        match = re.search(r"/(\d{4})/", href)
        if match:
            url_year = match.group(1)
            if url_year == year:
                date_match = re.search(r"(\d{4}-\d{2}-\d{2})\.html", href)
                if date_match:
                    date = date_match.group(1)
                    print(date)
    date = input("Enter selection as YYYY-MM-DD: ")
    sub_url = "http://blogfiles.wfmu.org/BT/Airplay_Lists/" + year + "/" + date + ".html"
    return handle_wfmu_list(get_soup(sub_url))
    

def handle_wfmu_list(soup):
    date = soup.title.text[28:]
    print(date)
    playlist_name = "WFMU Heavy Play " + date
    playlist_description = ""
    for ul in soup.find_all('ul'):
        if any(li.find('strong') for li in ul.find_all('li')):
            for li in ul.find_all('li'):
                match = re.match(r'^(.*?) - (.*?) \((.*?)\)$', li.text)
                if match:
                    artist_name, album_title, record_label = match.groups()
                    input_list.append((artist_name.title(), album_title))
    return playlist_name, playlist_description, input_list
```

##### Options 7 & 8: Browse and Select from Recent NTS Radio Broadcasts

- Differs from the standard options in that this is a track-based playlist builder
- Browse the latest from [NTS Radio](https://www.nts.live/)
- Returns the 12 most recent [broadcasts](https://www.nts.live/latest), including date, name of the program, broadcast location, and any tags
- Generates a playlist name `NTS: {broadcast title} ({dd.mm.yy})` and description `{#} tracks not found.{original episode description}. Broadcast: {YYYY-MM-DD}, {location}`
- Number of episodes returned can be modified by changing the value of `limit=12` at the beginning of the `handle_nts_latest` function.
- Option 8 offers the option to skip the browsing and provide an episode URL directly

_(Code to handle this is conceptually the same as the above WFMU list handler with modifications to handle the differing page structures)_

## How to Get Spotify API Credentials

To get the necessary info for your `.env` file you'll first need a (free) [Spotify Developer](https://developer.spotify.com/) account.

1. After logging in and landing on the dev dashboard click _Create app_.

   <img src="https://github.com/jsspen/listeners-friend/blob/main/imgs/createapp.JPG?raw=true" width="450" alt="Screenshot of the Create app screen from the Spotify Developer website">

2. Fill out the required fields:
   - Give your app a name (i.e. _Text-to-Playlist App_) and a brief description, maybe something to remind you why you made it.
   - For the Redirect URI you can supply your own or just use https://example.org/callback. Click _Add_.
   - Check the box for _Web API_ access and save.
3. After creating the app you'll be taken to its dashboard. Click _Settings_ in the top right corner. Everything you need for your `.env` file is here on this page:

   <img src="https://github.com/jsspen/listeners-friend/blob/main/imgs/appsettings.JPG?raw=true" width="450" alt="Screenshot of the app settings screen from the Spotify Developer website">

4. Copy the _Client ID_ and _Client Secret_ (click _View client secret_) to your `.env` file. If you forgot what Redirect URI you chose earlier you can also grab that from here. The `example.env` is prepopulated with `https://example.org/callback`.
5. You're ready to start building playlists!