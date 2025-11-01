const { Buffer } = require('node:buffer');
const ParsedRequest = require('./parsed-request');

const CRLF = '\r\n';
const SEPARATOR = '\r\n\r\n';

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
    console.debug('Get all data start parse');
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

module.exports = RequestParser;
