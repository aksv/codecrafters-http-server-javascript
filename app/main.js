const net = require("net");
const { Buffer } = require('node:buffer');

const Router = require('./router');
const { getFileHandleWithPath, saveFileHandleWithPath } = require('./handlers');
const { RequestParser } = require('./request');
const Response = require('./response');
const { getComandArguments } = require('./utils');



let clientIdsCounter = 0;
const parsers = new Map();

const cmdArguments = getComandArguments();

const fileHandler = getFileHandleWithPath(cmdArguments.get('directory'));
const saveFileHandler = saveFileHandleWithPath(cmdArguments.get('directory'));

const router = new Router();
router.get('/', (_, res) => {
  res.writeStatusLine(200, 'OK');
  res.endHeaders();
});

router.get('/echo/:str', (req, res) => {
  const respBody = req.params.str;
  const contentLength = Buffer.byteLength(respBody, 'utf-8');
  res.writeStatusLine(200, 'OK');
  res.writeHeader('Content-Type', 'text/plain');
  res.writeHeader('Content-Length', contentLength);
  res.endHeaders();
  res.writeContent(respBody);
});

router.get('/user-agent', (req, res) => {
  const respBody = req.getHeader('user-agent');
  const contentLength = Buffer.byteLength(respBody, 'ascii');
  res.writeStatusLine(200, 'OK');
  res.writeHeader('Content-Type', 'text/plain');
  res.writeHeader('Content-Length', contentLength);
  res.endHeaders();
  res.writeContent(respBody);
});

router.get('/files/:filename', async (req, res) => {
  await fileHandler(req, res);
});

router.post('/files/:filename', async (req, res) => {
  await saveFileHandler(req, res);
});

const server = net.createServer((socket) => {
  const clientId = ++clientIdsCounter;
  socket.on('data', async (chunk) => {
    let parser;
    if (parsers.has(clientId)) {
      parser = parsers.get(clientId);
    } else {
      parser = new RequestParser();
      parsers.set(clientId, parser);
    }
    parser.parseData(chunk);
    if (!parser.isRequestParsed()) {
      return;
    }
    const parsed = parser.parsedHeader;
    const response = new Response(socket);
    await router.handle(parsed, response);
    parsers.delete(clientId);
    socket.end();
  });
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
