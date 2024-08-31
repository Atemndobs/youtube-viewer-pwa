# YouTube Viewer Refine App

## Overview

The **YouTube Viewer Refine App** is a web application built with Next.js and the Refine framework, allowing users to view and control YouTube videos. It also includes a Chrome extension that loads the current tab's URL into the input field of the app.

## Features

- **Video Playback**: Enter a YouTube video URL to view and control playback.
- **Playback Controls**: Play, stop, rewind, and forward the video.
- **Chrome Extension**: Automatically load the current tab's URL into the input field when the extension is clicked.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: Comes with Node.js. Ensure it's up to date by running `npm install -g npm`.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/youtube-viewer.git
   cd youtube-viewer
Install Dependencies

bash
Copy code
npm install
Development
To run the development server:

bash
Copy code
npm run dev
This will start the server on http://localhost:3000 by default.

Chrome Extension
To use the Chrome extension functionality:

Update manifest.json and popup.js

Ensure that manifest.json and popup.js are correctly configured to handle URL extraction and communication with the web app.

Load the Extension into Chrome

Open Chrome and go to chrome://extensions/.
Enable "Developer mode" using the toggle in the top right.
Click "Load unpacked" and select the extension/ directory inside your project.
Building for Production
To build the application for production:

bash
Copy code
npm run build
This will create an optimized version of the app in the .next directory.

Deployment
Deploy the production build to your preferred hosting provider. You can use Vercel, Netlify, or any other service that supports Next.js applications.

Usage
Open the Application

Navigate to http://localhost:3000 in your web browser.

Enter a YouTube URL

Paste a YouTube video URL into the input field and click "Play Video" to start playback.

Use Playback Controls

Play: Start the video.
Stop: Stop the video.
Rewind 10s: Rewind the video by 10 seconds.
Forward 10s: Forward the video by 10 seconds.
Using the Chrome Extension

Click the extension icon in the Chrome toolbar.
The current tab's URL will be automatically populated in the input field.
Contributing
Contributions are welcome! If you find a bug or have a feature request, please open an issue or submit a pull request.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgements
Refine: A framework for building React-based admin interfaces.
Next.js: A React framework for server-rendered applications.
Ant Design: A popular React UI framework.
React-Youtube: A React component for embedding YouTube videos.