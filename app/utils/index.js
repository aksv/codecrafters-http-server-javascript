function countDashes(str) {
  return (str.match(/^(-+)/)?.[1].length) || 0
}

function getComandArguments() {
  const args = process.argv.slice(2);
  const cmdArgs = new Map();
  let i = 0;
  while (i < args.length) {
    const elem = args[i];
    const startDashesCount = countDashes(elem);
    if (startDashesCount === 2) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      cmdArgs.set(key, value);
      i += 2;
    } else if (startDashesCount === 1) {
      const key = args[i].slice(1);
      cmdArgs.set(key, true);
      i += 1;
    } else {
      // Just ignore
      i += 1;
    }
  }
  return cmdArgs;
}

module.exports = {
  getComandArguments,
}
