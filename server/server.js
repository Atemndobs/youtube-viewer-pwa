const express = require('express');
const next = require('next');
const { exec } = require('child_process');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(express.json());

  // Handle custom POST requests
  server.post('/receive-url', (req, res) => {
    const { url } = req.body;

    // Command to start the application with the URL
    exec(`open -a "YouTube viewer" ${url}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        res.status(500).send('Failed to open the app');
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      console.error(`YourTube URL: ${url}`);
      res.send('URL received and application opened');
    });
  });

  // Handle all other requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
