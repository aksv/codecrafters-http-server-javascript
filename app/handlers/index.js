const echoHandler = require('./echo-handler');

module.exports = {
  getFileHandleWithPath: require('./file-handler'),
  saveFileHandleWithPath: require('./create-file-handler'),
  echoHandler,
};
