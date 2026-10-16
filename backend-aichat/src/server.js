const http = require("http");
const Environment = require("./config/environment");
const app = require("./app");

/**
 * Service ini hanya REST biasa (tanpa Socket.IO dan tanpa database),
 * jadi cukup membuat HTTP server dari aplikasi Express.
 */
function startServer(port) {
  const httpServer = http.createServer(app);

  return new Promise((resolve) => {
    httpServer.listen(port, () => {
      resolve(httpServer);
    });
  });
}

async function main() {
  await startServer(Environment.port);

  console.log(
    `AI Chat Messenger aichat service listening on http://localhost:${Environment.port} ` +
      `(provider: ${Environment.aiProvider}, model: ${Environment.activeModel})`,
  );
}

if (require.main === module) {
  main();
}

module.exports = { startServer: startServer };
