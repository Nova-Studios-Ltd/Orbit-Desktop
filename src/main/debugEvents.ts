import { ipcMain, IpcMainEvent } from 'electron';
import chalk from 'chalk';
import { Debug } from '../shared/DebugLogger';
import { LogContext, LogType } from '../types/enums';

Debug.events.on('logEntryAdded', (message: (string | unknown), logType: LogType) => {
  switch (logType) {
    case LogType.Error:
      console.log(chalk.redBright.bold(message));
      break;
    case LogType.Warn:
      console.log(chalk.yellowBright.bold(message));
      break;
    case LogType.Success:
      console.log(chalk.greenBright.bold(message));
      break;
    case LogType.Info:
    default:
      console.log(chalk.bold(message));
  }
});

ipcMain.on('logEntryFromRenderer', (_event: IpcMainEvent, message: (string | unknown), logType: LogType, context?: string) => {
  Debug.appendToLog(message, logType, LogContext.Renderer, context);
});
