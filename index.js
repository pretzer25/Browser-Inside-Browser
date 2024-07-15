const puppeteer = require('puppeteer');
const WebSocket = require('ws');

let browser, page;

// Launch Puppeteer browser
async function launchBrowser() {
  browser = await puppeteer.launch({
    headless: false, // Set to false to allow interactive mode
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  page = await browser.newPage();
  await page.goto('https://youtube.com'); // Replace with the desired URL
}

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8080 });

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

// Launch Puppeteer on server start
launchBrowser().catch(console.error);

module.exports = (req, res) => {
  res.status(200).send('Puppeteer WebSocket server is running');
};
