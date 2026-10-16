const http = require("http");
const { Server } = require("socket.io");
const Environment = require("./config/environment");
const app = require("./app");
const ChatSocket = require("./sockets/ChatSocket");
const DatabaseCheckService = require("./services/DatabaseCheckService");

/**
 * Membuat HTTP server + Socket.IO server.
 * Dipisah dari startServer() agar test bisa membuat server di port lain.
 */
function createServer() {
  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: Environment.corsOrigin,
    },
  });

  ChatSocket.register(io);
  // Controller REST memakai io yang sama untuk menyiarkan event hapus (request.app.get('io')).
  app.set("io", io);

  return { httpServer: httpServer, io: io };
}

function startServer(port) {
  const server = createServer();

  return new Promise((resolve) => {
    server.httpServer.listen(port, () => {
      resolve(server);
    });
  });
}

async function main() {
  await DatabaseCheckService.ensureReady();
  await startServer(Environment.port);

  console.log(
    `AI Chat Messenger backend listening on http://localhost:${Environment.port}`,
  );
}

if (require.main === module) {
  main();
}

module.exports = { createServer: createServer, startServer: startServer };
