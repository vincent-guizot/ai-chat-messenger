const express = require('express');
const cors = require('cors');
const Environment = require('./config/environment');
const apiRoutes = require('./routes');
const ErrorMiddleware = require('./middlewares/ErrorMiddleware');

/**
 * Aplikasi Express (tanpa listen), supaya bisa dipakai oleh server.js maupun test.
 */
const app = express();

app.use(cors({ origin: Environment.corsOrigin }));
app.use(express.json());

app.use('/api', apiRoutes);

app.use(ErrorMiddleware.notFound);
app.use(ErrorMiddleware.handle);

module.exports = app;
