function countDashes(str) {
  return (str.match(/^(-+)/)?.[1].length) || 0
}

function getComandArguments(mandatoryKeys = [], defaultParams = {}) {
  const args = process.argv.slice(2);
  const cmdArgs = new Map();
  let i = 0;
  while (i < args.length) {
    const elem = args[i];
    const startDashesCount = countDashes(elem);
    let key;
    let value;
    if (startDashesCount === 2) {
      key = args[i].slice(2);
      value = args[i + 1];
      i += 2;
    } else if (startDashesCount === 1) {
      key = args[i].slice(1);
      value = true;
      i += 1;
    } else {
      // Just ignore
      i += 1;
      continue
    }
    cmdArgs.set(key, value);
  }
  for (const [key, value] of Object.entries(defaultParams)) {
    if (!cmdArgs.has(key)) {
      cmdArgs.set(key, value);
    }
  }
  if (mandatoryKeys.length > 0) {
    for (const mandatoryKey of mandatoryKeys) {
      if (!cmdArgs.has(mandatoryKey)) {
        throw new Error(`Property ${mandatoryKey} expected in app parameters`);
      }
    }
  }
  return cmdArgs;
}

function setCommonHeaders(req, res) {
  if (req.isHeaderExists('connection') && req.getHeader('connection') === 'close') {
    res.writeHeader('connection', 'close');
  }
}

module.exports = {
  getComandArguments,
  setCommonHeaders,
}
