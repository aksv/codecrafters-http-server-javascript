const { pipeline } = require('node:stream/promises');

const CRLF = '\r\n';
const protocolVersion = '1.1';

class Response {
  #socket
  constructor(socket) {
    this.#socket = socket;
  }

  writeStatusLine(code, reason, version = protocolVersion) {
    this.#socket.write(`HTTP/${version} ${code} ${reason}${CRLF}`);
  }

  writeHeader(header, value) {
    this.#socket.write(`${header}: ${value}${CRLF}`);
  }

  endHeaders() {
    this.#socket.write(CRLF)
  }

  writeContent(content) {
    this.#socket.write(content);
  }

  async sendFileStream(fileHandle) {
    await pipeline(fileHandle.createReadStream(), this.#socket);
  }
}

module.exports = Response;
