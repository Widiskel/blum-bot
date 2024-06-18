import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

class Logger {
  constructor() {
    this.logger = createLogger({
      level: "debug",
      format: combine(
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        colorize(),
        customFormat
      ),
      transports: [new transports.File({ filename: "log/app.log" })],
      exceptionHandlers: [new transports.File({ filename: "log/app.log" })],
      rejectionHandlers: [new transports.File({ filename: "log/app.log" })],
    });
  }

  info(message) {
    this.logger.info(message);
  }

  warn(message) {
    this.logger.warn(message);
  }

  error(message) {
    this.logger.error(message);
  }

  debug(message) {
    this.logger.debug(message);
  }

  setLevel(level) {
    this.logger.level = level;
  }
}

export default new Logger();
