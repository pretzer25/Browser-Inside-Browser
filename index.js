const puppeteer = require('puppeteer');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

let browser, page;

async function launchBrowser() {
  browser = await puppeteer.launch({
    headless: false, // Set to false to allow interactive mode
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  page = await browser.newPage();
  await page.goto('https://example.com'); // Replace with the desired URL
}

// WebSocket server setup
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const command = JSON.parse(message);
    
    if (command.action === 'navigate') {
      await page.goto(command.url);
      ws.send(JSON.stringify({ status: 'navigated' }));
    }
    
    // Add more actions as needed
  });
});

// HTTP server to serve static files and handle WebSocket upgrade
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(indexPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

launchBrowser().catch(console.error);

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

module.exports = (req, res) => {
  res.status(200).send('Puppeteer WebSocket server is running');
};
