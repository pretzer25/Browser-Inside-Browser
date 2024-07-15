const puppeteer = require('puppeteer');
const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

let browser, page;

async function launchBrowser() {
  browser = await puppeteer.launch({
    headless: false, // Set to false to allow interactive mode
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  page = await browser.newPage();
  await page.goto('https://example.com'); // Replace with the desired URL
}

// Create a HTTPS server (you need to provide SSL certificate and key files)
const server = https.createServer({
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
});

// WebSocket server setup
const wss = new WebSocket.Server({ server });

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

launchBrowser().catch(console.error);

server.listen(3000, () => {
  console.log('Secure WebSocket server is running on port 3000');
});

module.exports = server;
