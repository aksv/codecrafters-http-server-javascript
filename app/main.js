const net = require("net");

// TODO: move to consts
const CRLF = '\r\n';

// TODO: move to config
const protocolVersion = '1.1';

// TODO: move to utils module
function makeResponse(version, code, reasonPhrase) {
  return `HTTP/${version} ${code} ${reasonPhrase}${CRLF}${CRLF}`;
}

const server = net.createServer((socket) => {
  const response = makeResponse(protocolVersion, 200, 'OK');
  socket.write(response);
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
