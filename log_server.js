const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Received log:', body);
      fs.appendFileSync('layout_logs.txt', body + '\n');
      res.writeHead(200);
      res.end('Logged');
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3005, () => {
  console.log('Log server listening on port 3005');
});
