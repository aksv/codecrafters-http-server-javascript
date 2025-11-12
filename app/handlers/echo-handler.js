const zlib = require('node:zlib');
const { promisify } = require('node:util');

const { setCommonHeaders } = require('../utils');

const gzip = promisify(zlib.gzip);

async function echoHandler(req, res) {
  const respBody = req.params.str ?? '';
  const acceptEncoding = req.getHeader('accept-encoding');
  const shouldCompress = acceptEncoding && acceptEncoding.split(',').some((enc) => enc.trim() === 'gzip');
  let responseBuffer = Buffer.from(respBody, 'utf-8');
  if (shouldCompress) {
    responseBuffer = await gzip(responseBuffer);
  }
  res.writeStatusLine(200, 'OK');
  if (shouldCompress) {
    res.writeHeader('Content-Encoding', 'gzip');
  }
  res.writeHeader('Content-Type', 'text/plain');
  res.writeHeader('Content-Length', responseBuffer.length);
  setCommonHeaders(req, res);
  res.endHeaders();
  res.writeContent(responseBuffer);
}

module.exports = echoHandler;
