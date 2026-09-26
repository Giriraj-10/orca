const levels = {
  INFO: '\x1b[36m[INFO]\x1b[0m',
  WARN: '\x1b[33m[WARN]\x1b[0m',
  ERROR: '\x1b[31m[ERROR]\x1b[0m',
  SUCCESS: '\x1b[32m[SUCCESS]\x1b[0m',
  AGENT: '\x1b[35m[AGENT]\x1b[0m'
};

function formatMessage(level, message, ...args) {
  const timestamp = new Date().toISOString().substring(11, 19);
  return `\x1b[90m${timestamp}\x1b[0m ${level} ${message}`;
}

const logger = {
  info: (msg, ...args) => console.log(formatMessage(levels.INFO, msg), ...args),
  warn: (msg, ...args) => console.warn(formatMessage(levels.WARN, msg), ...args),
  error: (msg, ...args) => console.error(formatMessage(levels.ERROR, msg), ...args),
  success: (msg, ...args) => console.log(formatMessage(levels.SUCCESS, msg), ...args),
  debug: (msg, ...args) => {
    if (process.env.DEBUG === 'true') {
      console.log(formatMessage('\x1b[90m[DEBUG]\x1b[0m', msg), ...args);
    }
  },
  agent: (agentName, msg, ...args) => console.log(formatMessage(levels.AGENT, `\x1b[1m[${agentName}]\x1b[0m ${msg}`), ...args)
};

module.exports = logger;
