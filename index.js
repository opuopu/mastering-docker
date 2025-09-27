// index.js
const express = require('express');
const winston = require('winston');
const path = require('path');

const app = express();

// Create logs folder path
const logDir = path.join(__dirname, 'logs');

// Winston logger configuration
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'errors.log') }),
    new winston.transports.Console(), // Optional: also log to console
  ],
});

// Middleware to parse JSON
app.use(express.json());

// Sample async route that throws an error
app.get('/error', async (req, res, next) => {
  try {
    // Simulate async error
    await new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Something went wrong!')), 500)
    );
  } catch (err) {
    next(err); // Pass error to Express error handler
  }
});

// Global error handler middleware
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
  });

  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
