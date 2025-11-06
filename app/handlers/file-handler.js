const { stat, open } = require('node:fs/promises');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');

const fileHandlerWithPath = require('./file-hanlder-with-path');

async function getFileSize(path) {
  try {
    const fileStat = await stat(path);
    return [undefined, fileStat.size];
  } catch (err) {
    return [err, undefined];
  }
}

function translateError(error) {
  if (error.code === 'ENOENT') {
    return [404, 'Not Found'];
  }
  return [500, 'Internal Server Error'];
}

async function fileHandler(parsedRequest, targetDir, response) {
  const fileName = parsedRequest.params.filename;
  const filePath = path.join(targetDir, fileName);
  try {
    const [err, fileSize] = await getFileSize(filePath);
    if (err) {
      const [errCode, errString] = translateError(err);
      response.writeStatusLine(errCode, errString);
      response.endHeaders();
      return;
    }
    response.writeStatusLine(200, 'OK');
    response.writeHeader('Content-Type', 'application/octet-stream');
    response.writeHeader('Content-Length', fileSize);
    response.endHeaders();
    const fileHandle = await open(filePath);
    await pipeline(fileHandle.createReadStream(), response);
  } catch (err) {
    const [errCode, errString] = translateError(err);
    response.writeStatusLine(errCode, errString);
    response.endHeaders();
  }
}

module.exports = fileHandlerWithPath(fileHandler);
