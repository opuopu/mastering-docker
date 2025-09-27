// index.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

const app = express();

// Ensure logs directory exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Function to generate timestamped log filename
function getLogFileName() {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  return path.join(logDir, `error-${timestamp}.log`);
}

// Base logger (console only)
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
  exitOnError: false,
});

app.use(express.json());

// Test async error route
app.get('/error', async (req, res, next) => {
  try {
    await new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Async failure!')), 500)
    );
  } catch (err) {
    next(err);
  }
});

app.get('/logs', (req, res) => {
  fs.readdir(logDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read logs directory' });
    }

    // Only include .log files
    const logFiles = files.filter(file => file.endsWith('.log'));

    res.json({
      count: logFiles.length,
      files: logFiles,
    });
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const errorFile = getLogFileName();

  // Create a dedicated logger just for this error file
  const fileLogger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [new winston.transports.File({ filename: errorFile })],
  });

  fileLogger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
  });

  // Also log to console
  logger.error(`Error logged in ${errorFile}: ${err.message}`);

  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
