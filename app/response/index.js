const { Writable } = require('node:stream');

const CRLF = '\r\n';
const protocolVersion = '1.1';

class Response extends Writable {
  #socket
  constructor(socket) {
    super();
    this.#socket = socket;
  }

  _write(chunk, encoding, callback) {
    this.#socket.write(chunk, encoding, callback);
  }

  _writev(chunks, callback) {
    const buffers = chunks.map(({ chunk }) => chunk);
    this.#socket.write(Buffer.concat(buffers), callback);
  }

  _final(callback) {
    callback();
  }

  _destroy(err, callback) {
    callback(err);
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
}

module.exports = Response;
