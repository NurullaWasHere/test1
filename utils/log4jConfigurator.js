import log4js from 'log4js';
import os from 'os';

/**
 * Configures log4j
 */
export default class Log4jConfigurator {
  /**
   * Configures and initializes logger
   * @param {string} defaultLevel
   * @returns {void}
   */
  configureLogger(defaultLevel) {
    const allowedLogLevels = ['ALL', 'INFO', 'ERROR', 'DEBUG', 'TRACE', 'WARN', 'FATAL', 'OFF'];
    if (allowedLogLevels.includes(defaultLevel)) {
      this.initializeLogger(defaultLevel);
    } else {
      this.initializeLogger('INFO');
      log4js
        .getLogger('Log4jConfigurator')
        .warn(`Logger level ${defaultLevel} is not allowed. Using default level 'INFO'`);
    }
  }

  initializeLogger(defaultLevel) {
    log4js.configure({
      appenders: {
        console: {
          type: 'console'
        },
        file: {
          type: 'dateFile',
          filename: `${os.homedir()}/.infrastructure-manager/logs/im.log`,
          pattern: '.yyyy-MM-dd',
          numBackups: 2,
          daysToKeep: 2
        }
      },
      categories: {
        default: {
          appenders: ['console', 'file'],
          level: defaultLevel
        }
      }
    });
  }
}
