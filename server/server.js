// Require needed modules and initialize Express app
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
// Middleware for GET /events endpoint
function eventsHandler(req, res, next) {
  // Mandatory headers and http status to keep connection open
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);
  // After client opens connection send all nests as string
  const data = { auth: true };
  res.write(data);
  // Generate an id based on timestamp and save res
  // object of client connection on clients list
  // Later we'll iterate it and send updates to each client
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);
  // When client closes connection we update the clients list
  // avoiding the disconnected one
  req.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(c => c.id !== clientId);
  });
}
// Iterate clients list and use write res object method to send new nest
function sendEventsToAll(newNest) {
  clients.forEach(c => c.res.write(JSON.stringify(newNest)))
}
// Middleware for POST /nest endpoint
async function addNest(req, res, next) {
  const newNest = req.body;
  nests.push(newNest);
  // Send recently added nest as POST result
  res.json(newNest)
  // Invoke iterate and send function
  return sendEventsToAll(newNest);
}
// Set cors and bodyParser middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// Define endpoints
app.post('/nest', addNest);
app.get('/events', eventsHandler);
app.get('/status', (req, res) => res.json({clients: clients.length}));
const PORT = 4000;
let clients = [];
let nests = [];
app.listen(PORT);
