const { open } = require('node:fs/promises');
const path = require('node:path');

const fileHandlerWithPath = require('./file-hanlder-with-path');

function translateError(error) {
  if (error.code === 'ENOENT') {
    return [404, 'Not Found'];
  }
  return [500, 'Internal Server Error'];
}

async function createFileHandler(request, targetDir, response) {
  const fileName = request.params.filename;
  const filePath = path.join(targetDir, fileName);
  try {
    const fh = await open(filePath, 'w');
    await fh.writeFile(request.body);
    response.writeStatusLine(201, 'Created');
    response.endHeaders();
  } catch (error) {
    const [errCode, errString] = translateError(error);
    response.writeStatusLine(errCode, errString);
    response.endHeaders();
  }
}

module.exports = fileHandlerWithPath(createFileHandler);
