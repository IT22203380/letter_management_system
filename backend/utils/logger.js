// const { createLogger, format, transports, addColors } = require("winston");

// // Define log directories
// const fs = require("fs");
// const path = require("path");
// const logsDir = "logs";

// const systemLogDir = path.join(logsDir, "system_log");
// const activityLogDir = path.join(logsDir, "activity_log");
// const securityLogDir = path.join(logsDir, "security_log");

// // systemLogger: for general info, warnings, and errors
// // activityLogger: for user actions like login, logout, CRUD operations
// // securityLogger: for permission issues, token access, etc.

// // Create directories if they don't exist
// [systemLogDir, activityLogDir, securityLogDir].forEach((dir) => {
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// });

// // Custom levels and colors
// const customLevels = {
//   levels: {
//     security: 0,
//     error: 1,
//     warn: 2,
//     info: 3,
//     activity: 4,
//   },
//   colors: {
//     error: "red",
//     info: "blue",
//     warn: "orange",
//     activity: "green",
//     security: "magenta",
//   },
// };

// addColors(customLevels.colors);

// // Filter function to handle different log levels
// const filterOnly = (level) =>
//   format((info) => {
//     return info.level === level ? info : false;
//   })();

// // Timezone function
// const timezoned = () =>
//   new Date().toLocaleString("en-US", {
//     timeZone: "Asia/Colombo",
//   });

// // Reusable format functions
// const consoleFormat = format.combine(
//   format.colorize({ all: true }),
//   format.timestamp({ format: timezoned }),
//   format.printf(({ level, message, timestamp }) => {
//     return `[${timestamp}] ${level}: ${message}`;
//   })
// );

// const fileFormat = format.combine(
//   format.timestamp({ format: timezoned }),
//   format.json()
// );

// // System Logger
// const systemLogger = createLogger({
//   levels: customLevels.levels,
//   transports: [
//     // Console - shows all levels
//     new transports.Console({
//       format: consoleFormat,
//     }),
//     // Info log file - only info messages
//     new transports.File({
//       level: "info",
//       filename: path.join(systemLogDir, "info.log"),
//       format: format.combine(filterOnly("info"), fileFormat),
//     }),
//     // Error log file - only error messages
//     new transports.File({
//       level: "error",
//       filename: path.join(systemLogDir, "error.log"),
//       format: format.combine(filterOnly("error"), fileFormat),
//     }),
//   ],
// });

// // Activity Logger
// const activityLogger = createLogger({
//   levels: customLevels.levels,
//   level: "activity",
//   transports: [
//     // Console - shows all levels
//     new transports.Console({
//       format: consoleFormat,
//     }),
//     // Activity log file - only activity messages
//     new transports.File({
//       level: "activity",
//       filename: path.join(activityLogDir, "info.log"),
//       format: format.combine(filterOnly("activity"), fileFormat),
//     }),
//     // Error log file - only error messages
//     new transports.File({
//       level: "error",
//       filename: path.join(activityLogDir, "error.log"),
//       format: format.combine(filterOnly("error"), fileFormat),
//     }),
//   ],
// });

// // Security Logger
// const securityLogger = createLogger({
//   levels: customLevels.levels,
//   level: "security",
//   transports: [
//     // Console - shows all levels
//     new transports.Console({
//       format: consoleFormat,
//     }),
//     // Security log file - only security info messages
//     new transports.File({
//       level: "security",
//       filename: path.join(securityLogDir, "info.log"),
//       format: format.combine(filterOnly("security"), fileFormat),
//     }),
//     // Security log file - only security warning messages
//     new transports.File({
//       level: "warn",
//       filename: path.join(securityLogDir, "warn.log"),
//       format: format.combine(filterOnly("warn"), fileFormat),
//     }),
//     // Error log file - only error messages
//     new transports.File({
//       level: "error",
//       filename: path.join(securityLogDir, "error.log"),
//       format: format.combine(filterOnly("error"), fileFormat),
//     }),
//   ],
// });

// module.exports = { systemLogger, activityLogger, securityLogger };


const { createLogger, format, transports, addColors } = require("winston");
const { combine, timestamp, printf } = format;
const fs = require("fs");
const path = require("path");

// Create logs directory if it doesn't exist
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom format without colorize for file transport
const fileFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Custom format for console with simple colors
const consoleFormat = printf(({ level, message, timestamp }) => {
  const colorMap = {
    error: '\x1b[31m', // red
    warn: '\x1b[33m',  // yellow
    info: '\x1b[36m',  // cyan
    debug: '\x1b[32m', // green
  };
  const color = colorMap[level] || '\x1b[0m'; // default to no color
  return `${timestamp} ${color}[${level.toUpperCase()}]\x1b[0m: ${message}`;
});

// Create loggers
const systemLogger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        consoleFormat
      )
    }),
    new transports.File({
      filename: path.join(logDir, "system.log"),
      format: combine(timestamp(), fileFormat),
    }),
  ],
});

const activityLogger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        consoleFormat
      )
    }),
    new transports.File({
      filename: path.join(logDir, "activity.log"),
      format: combine(timestamp(), fileFormat),
    }),
  ],
});

const securityLogger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        consoleFormat
      )
    }),
    new transports.File({
      filename: path.join(logDir, "security.log"),
      format: combine(timestamp(), fileFormat),
    }),
  ],
});

module.exports = { systemLogger, activityLogger, securityLogger };