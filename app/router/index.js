class Router {
  #paramsRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
  #allowedChars = /^[a-zA-Z0-9/_\-.:]+$/;
  #handlers
  constructor() {
    this.#handlers = new Map();
  }

  // TODO: add regexp route pattern support
  #parseUrlPattern(pattern) {
    if (!pattern || typeof pattern !== 'string') {
      throw new TypeError('URL pattern must be a non-empty string');
    }
    if (!this.#allowedChars.test(pattern)) {
      throw new Error('Only alphanumeric, /, -, _, ., and :param placeholders are allowed');
    }
    const invalidParam = pattern.match(/:(\d[a-zA-Z0-9_]*)/);
    if (invalidParam) {
      throw new Error(
        `Invalid parameter name ":${invalidParam[1]}" in pattern "${pattern}"`
      );
    }
    const paramNames = [];
    this.#paramsRegex.lastIndex = 0;
    const regexPattern = pattern.replace(this.#paramsRegex, (_, param) => {
      if (paramNames.includes(param)) {
        throw new Error(
          `Duplicate parameter name ":${param}" in pattern "${pattern}"`
        );
      }
      paramNames.push(param);
      return '([^/]+)';
    });
    const regex = new RegExp('^' + regexPattern + '$');
    return [regex, paramNames];
  }

  #extractParams(urlMatch, paramNames) {
    const params = {};
    for (let i = 0; i < paramNames.length; i++) {
      params[paramNames[i]] = urlMatch[i + 1];
    }
    return params;
  }

  #addHandler(method, path, handler) {
    if (!this.#handlers.has(method)) {
      this.#handlers.set(method, []);
    }
    this.#handlers.get(method).push([...this.#parseUrlPattern(path), handler]);
  }

  get(path, handler) {
    this.#addHandler('GET', path, handler);
  }

  post(path, handler) {
    this.#addHandler('POST', path, handler);
  }

  async handle(request, response) {
    for (const [regex, paramNames, handler] of this.#handlers.get(request.method)) {
      const match = request.target.match(regex);
      if (match) {
        if (paramNames.length > 0) {
          request.params = this.#extractParams(match, paramNames);
        }
        await handler(request, response);
        return;
      }
    }
    // If route handler not found
    response.writeStatusLine(404, 'Not Found');
    response.endHeaders();
  }
}

module.exports = Router;
