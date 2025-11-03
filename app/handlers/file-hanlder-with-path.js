function fileHandlerWithPath(fileHandler) {
  return (targetDir) => {
    return async (request, response) => {
      return fileHandler(request, targetDir, response);
    };
  };
}

module.exports = fileHandlerWithPath;
