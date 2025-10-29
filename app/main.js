const net = require("net");
const { Buffer } = require('node:buffer');

// TODO: move to consts
const CRLF = '\r\n';
const MAX_START_LINE = 8 * 1024;

// TODO: move to config
const protocolVersion = '1.1';

// TODO: move to utils module
function makeResponse(version, code, reasonPhrase) {
  return `HTTP/${version} ${code} ${reasonPhrase}${CRLF}${CRLF}`;
}

function getStatusLine(version, code, reasonPhrase) {
  return `HTTP/${version} ${code} ${reasonPhrase}`;
}

let clientIdsCounter = 0;
const buffers = new Map();

const server = net.createServer((socket) => {
  const clientId = ++clientIdsCounter;
  let startLineParsed = false;
  socket.on('data', (chunk) => {
    let buff;
    if (buffers.has(clientId)) {
      buff = buffers.get(clientId);
    } else {
      buff = Buffer.alloc(0);
      buffers.set(clientId, buff);
    }
    buff = Buffer.concat([buff, chunk]);
    const crlfIdx = buff.indexOf(CRLF);

    if (!startLineParsed && crlfIdx === -1) {
      if (buff.length > MAX_START_LINE) {
        socket.destroy(new Error('Start-line is too long'));
      }
      return;
    }

    const startLineBuff = buff.subarray(0, crlfIdx)
    const startLine = startLineBuff.toString('ascii');
    buff = buff.subarray(crlfIdx + 1); // drop start line + CRLF

    const firstSpaceIdx = startLine.indexOf(' ');
    const secondSpaceIdx = startLine.indexOf(' ', firstSpaceIdx + 1);
    if (firstSpaceIdx < 1 || secondSpaceIdx === -1) {
      throw new Error('Bad start-line');
    }

    const method = startLine.slice(0, firstSpaceIdx);
    const target = startLine.slice(firstSpaceIdx + 1, secondSpaceIdx);
    const versionStr = startLine.slice(secondSpaceIdx + 1);

    let response;
    if (target === '/') {
      response = makeResponse(protocolVersion, 200, 'OK');
    } else if (target.startsWith('/echo')) {
      const responseBody = target.slice(6);
      const contentLength = Buffer.byteLength(responseBody, 'utf-8');
      const responseMsg = [];
      responseMsg.push(getStatusLine(protocolVersion, 200, 'OK'));
      responseMsg.push(CRLF);
      responseMsg.push('Content-Type: text/plain');
      responseMsg.push(CRLF);
      responseMsg.push(`Content-Length: ${contentLength}`);
      responseMsg.push(CRLF);
      responseMsg.push(CRLF);
      responseMsg.push(responseBody);
      response = responseMsg.join('');
    } else {
      response = makeResponse(protocolVersion, 404, 'Not Found');
    }
    buffers.set(clientId, Buffer.alloc(0));
    socket.write(response);
    socket.end();
  });
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
