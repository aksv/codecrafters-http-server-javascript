const { Buffer } = require('node:buffer');
const RequestParser = require('./request-parser');
const ParsedRequest = require('./parsed-request');

describe('RequestParser', () => {
  it('should parse simple HTTP request', () => {
    const httpRequest = ['GET /api/method HTTP/1.1',
      '',
      ''
    ].join(`\r\n`);
    const parser = new RequestParser();
    const requestBuffer = Buffer.from(httpRequest, 'ascii');
    const chunkSize = 10;
    for (let i = 0; i < requestBuffer.length; i += chunkSize) {
      let chunk;
      if (i + chunkSize >= requestBuffer.length) {
        chunk = requestBuffer.subarray(i);
      } else {
        chunk = requestBuffer.subarray(i, i + chunkSize);
      }
      parser.parseData(chunk);
    }
    expect(parser.isHeaderPasred()).toBe(true);
    const parsedRequest = parser.parsedHeader;
    expect(parsedRequest.method).toBe('GET');
    expect(parsedRequest.target).toBe('/api/method');
    expect(parsedRequest.version).toBe('HTTP/1.1');
  })
});
