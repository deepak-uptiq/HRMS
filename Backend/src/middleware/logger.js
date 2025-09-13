const morgan = require('morgan');
const logger = require('../config/logger');

// Create a custom stream for Morgan
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Create Morgan middleware
const requestLogger = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream }
);

module.exports = { requestLogger };
