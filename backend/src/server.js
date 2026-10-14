const http = require('http');
const { Server } = require('socket.io');
const Environment = require('./config/environment');
const app = require('./app');
const ChatSocket = require('./sockets/ChatSocket');

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

if (require.main === module) {
  startServer(Environment.port).then(() => {
    console.log(`AI Chat Messenger backend listening on http://localhost:${Environment.port}`);
  });
}

module.exports = { createServer: createServer, startServer: startServer };
