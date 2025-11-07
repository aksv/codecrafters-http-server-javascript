const { PassThrough, Transform } = require('node:stream');

class ParsedRequest {
  #method
  #target
  #version
  #headers = new Map()
  #body
  #bodyStream = new PassThrough();
  #bodyBytesRead = 0;

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

  writeBody(chunk) {
    const contentLength = parseInt(this.getHeader('content-length') || '0');
    if (this.#bodyBytesRead >= contentLength) {
      throw new Error('No more data expected');
    }
    this.#bodyBytesRead += chunk.length;
    this.#bodyStream.write(chunk);
    if (this.#bodyBytesRead === contentLength) {
      this.#bodyStream.end();
      return false;
    }
    return true;
  }

  get bodyStream() {
    return this.#bodyStream;
  }

  set body(body) {
    this.#body = body;
  }

  get body() {
    return this.#body;
  }
}

module.exports = ParsedRequest;
