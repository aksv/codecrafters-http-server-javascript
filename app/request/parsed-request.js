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

module.exports = ParsedRequest;
