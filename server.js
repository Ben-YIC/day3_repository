// Plain Node http server exposing the /products API.

const http = require('http');
const productsApi = require('./src/productsApi');

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/products') {
      sendJson(res, 200, productsApi.getAllProducts());
      return;
    }

    if (req.method === 'POST' && req.url === '/products') {
      let body;
      try {
        const raw = await readBody(req);
        body = raw ? JSON.parse(raw) : {};
      } catch (err) {
        sendJson(res, 400, { error: 'invalid JSON body' });
        return;
      }
      try {
        const product = productsApi.createProduct(body);
        sendJson(res, 201, product);
      } catch (err) {
        sendJson(res, 400, { error: err.message });
      }
      return;
    }

    sendJson(res, 404, { error: 'not found' });
  });
}

module.exports = { createServer };
