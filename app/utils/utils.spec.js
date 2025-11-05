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

  it('should validate mandatory arguments', () => {
    jest.replaceProperty(process, 'argv', ['/usr/local/bin/node', '/test/file.js', '-f']);
    expect(() => getComandArguments(['directory'])).toThrow();
  });

   it('should use defaults for argument if argument not specified', () => {
    jest.replaceProperty(process, 'argv', ['/usr/local/bin/node', '/test/file.js', '-e']);
    const cmdArgs = getComandArguments(['directory'], { directory: '/home' });
    expect(cmdArgs.has('directory'));
    expect(cmdArgs.get('directory')).toBe('/home');
  });
});
