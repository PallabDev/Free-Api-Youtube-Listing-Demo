# YouTube Listing

A simple YouTube-style video listing page built with HTML, Tailwind CSS, and vanilla JavaScript.

## Features

- Fetches public YouTube video data from the FreeAPI endpoint
- Renders video thumbnails, titles, channel names, views, and publish time
- Shows loading skeletons while data is being fetched
- Displays a fallback error message if the API request fails
- Opens each video in YouTube when a card is clicked

## Project Files

- `index.html` - page structure and UI
- `script.js` - fetches API data and renders the video cards

## Run Locally

Open the project with a local server such as VS Code Live Server.

Why: if you open `index.html` directly with `file://`, the API request may fail in some browsers and the videos may not load.

## API Used

`https://api.freeapi.app/api/v1/public/youtube/videos`

## Notes

- The UI is inspired by YouTube's home feed layout
- The app uses no build tools or frameworks, so it is easy to edit and learn from
