const { createLogger, format, transports, addColors } = require("winston");

// Define log directories
const fs = require("fs");
const path = require("path");
const logsDir = "logs";

const systemLogDir = path.join(logsDir, "system_log");
const activityLogDir = path.join(logsDir, "activity_log");
const securityLogDir = path.join(logsDir, "security_log");

// systemLogger: for general info, warnings, and errors
// activityLogger: for user actions like login, logout, CRUD operations
// securityLogger: for permission issues, token access, etc.

// Create directories if they don't exist
[systemLogDir, activityLogDir, securityLogDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Custom levels and colors
const customLevels = {
  levels: {
    security: 0,
    error: 1,
    warn: 2,
    info: 3,
    activity: 4,
  },
  colors: {
    error: "red",
    info: "blue",
    warn: "orange",
    activity: "green",
    security: "magenta",
  },
};

addColors(customLevels.colors);

// Filter function to handle different log levels
const filterOnly = (level) =>
  format((info) => {
    return info.level === level ? info : false;
  })();

// Timezone function
const timezoned = () =>
  new Date().toLocaleString("en-US", {
    timeZone: "Asia/Colombo",
  });

// Reusable format functions
const consoleFormat = format.combine(
  format.timestamp({ format: timezoned }),
  format.printf(({ level, message, timestamp, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaString}`;
  })
);

const fileFormat = format.combine(
  format.timestamp({ format: timezoned }),
  format.json()
);

// System Logger
const systemLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: consoleFormat
    }),
    new transports.File({
      filename: path.join(systemLogDir, 'system.log'),
      format: format.combine(
        format.timestamp({ format: timezoned }),
        format.json()
      )
    })
  ]
});

// Activity Logger
const activityLogger = createLogger({
  levels: customLevels.levels,
  level: "activity",
  transports: [
    // Console - shows all levels
    new transports.Console({
      format: consoleFormat,
    }),
    // Activity log file - only activity messages
    new transports.File({
      level: "activity",
      filename: path.join(activityLogDir, "info.log"),
      format: format.combine(filterOnly("activity"), fileFormat),
    }),
    // Error log file - only error messages
    new transports.File({
      level: "error",
      filename: path.join(activityLogDir, "error.log"),
      format: format.combine(filterOnly("error"), fileFormat),
    }),
  ],
});

// Security Logger
const securityLogger = createLogger({
  levels: customLevels.levels,
  level: "security",
  transports: [
    // Console - shows all levels
    new transports.Console({
      format: consoleFormat,
    }),
    // Security log file - only security info messages
    new transports.File({
      level: "security",
      filename: path.join(securityLogDir, "info.log"),
      format: format.combine(filterOnly("security"), fileFormat),
    }),
    // Security log file - only security warning messages
    new transports.File({
      level: "warn",
      filename: path.join(securityLogDir, "warn.log"),
      format: format.combine(filterOnly("warn"), fileFormat),
    }),
    // Error log file - only error messages
    new transports.File({
      level: "error",
      filename: path.join(securityLogDir, "error.log"),
      format: format.combine(filterOnly("error"), fileFormat),
    }),
  ],
});

module.exports = { systemLogger, activityLogger, securityLogger };


