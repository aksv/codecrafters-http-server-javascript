const { getComandArguments } = require('./index');

describe('getComandArguments', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should parse directory argument', () => {
    jest.replaceProperty(process, 'argv', ['/usr/local/bin/node', '/test/file.js', '-f', '--directory', '/tmp/']);
    const cmdArgs = getComandArguments();
    expect(cmdArgs.has('directory'));
    expect(cmdArgs.get('directory')).toBe('/tmp/');
  });
});
