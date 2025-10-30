const net = require("net");
const { Buffer } = require('node:buffer');

// TODO: move to consts
const CRLF = '\r\n';
const SEPARATOR = '\r\n\r\n';
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

function userAgentRouteHandler() {

}

let clientIdsCounter = 0;
const parsers = new Map();

class ParsedRequest {
  #method
  #target
  #version
  #headers = new Map()

  get method() {
    return this.#method;
  }

  set method(method) {
    this.#method = method;
  }

  get target() {
    return this.#target;
  }

  set target(target) {
    this.#target = target;
  }

  get version() {
    return this.#version;
  }

  set version(version) {
    this.#version = version;
  }

  setHeader(header, value) {
    this.#headers.set(header, value);
  }

  getHeader(header) {
    return this.#headers.get(header);
  }

  isHeaderExists(header) {
    return this.#headers.has(header);
  }
}

class RequestParser {
  #buffer;
  #isHeaderParsed = false;
  #parsedRequest = new ParsedRequest();

  constructor() {
    this.#buffer = Buffer.alloc(0);
  }

  isHeaderPasred() {
    return this.#isHeaderParsed;
  }

  get parsedHeader() {
    return this.#parsedRequest;
  }

  parseData(chunk) {
    this.#buffer = Buffer.concat([this.#buffer, chunk]);
    const separatorIdx = this.#buffer.indexOf(SEPARATOR);
    if (separatorIdx === -1) {
      return;
    }
    // Parse start line
    const crlfIdx = this.#buffer.indexOf(CRLF);
    const startLineBuff = this.#buffer.subarray(0, crlfIdx);
    const startLine = startLineBuff.toString('ascii');
    const firstSpaceIdx = startLine.indexOf(' ');
    const secondSpaceIdx = startLine.indexOf(' ', firstSpaceIdx + 1);
    if (firstSpaceIdx < 1 || secondSpaceIdx === -1) {
      throw new Error('Bad start-line');
    }
    this.#parsedRequest.method = startLine.slice(0, firstSpaceIdx);
    this.#parsedRequest.target = startLine.slice(firstSpaceIdx + 1, secondSpaceIdx);
    this.#parsedRequest.version = startLine.slice(secondSpaceIdx + 1);

    // parse headers
    const headersBuff = this.#buffer.subarray(crlfIdx + 1, separatorIdx);
    for (const line of headersBuff.toString('ascii').split(CRLF)) {
      if (!line) {
        continue;
      }
      const [name, value] = line.split(/:(.*)/).map(val => val.trim());
      if (name && value) {
        this.#parsedRequest.setHeader(name.toLowerCase(), value);
      }
    }
    this.#isHeaderParsed = true;
  }
}

const server = net.createServer((socket) => {
  const clientId = ++clientIdsCounter;
  socket.on('data', (chunk) => {
    let parser;
    if (parsers.has(clientId)) {
      parser = parsers.get(clientId);
    } else {
      parser = new RequestParser();
      parsers.set(clientId, parser);
    }
    parser.parseData(chunk);
    if (!parser.isHeaderPasred()) {
      return;
    }
    const parsed = parser.parsedHeader;
    let response;
    if (parsed.target === '/') {
      response = makeResponse(protocolVersion, 200, 'OK');
    } else if (parsed.target.startsWith('/echo')) {
      const responseBody = parsed.target.slice(6);
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
    } else if (parsed.target.startsWith('/user-agent')) {
      const userAgent = parsed.getHeader('user-agent');
      const contentLength = Buffer.byteLength(userAgent, 'ascii');
      const responseMsg = [];
      responseMsg.push(getStatusLine(protocolVersion, 200, 'OK'));
      responseMsg.push(CRLF);
      responseMsg.push('Content-Type: text/plain');
      responseMsg.push(CRLF);
      responseMsg.push(`Content-Length: ${contentLength}`);
      responseMsg.push(CRLF);
      responseMsg.push(CRLF);
      responseMsg.push(userAgent);
      response = responseMsg.join('');
    } else {
      response = makeResponse(protocolVersion, 404, 'Not Found');
    }
    parsers.delete(clientId);
    socket.write(response);
    socket.end();
  });
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
