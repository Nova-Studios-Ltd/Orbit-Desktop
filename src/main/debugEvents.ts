import { ipcMain, IpcMainEvent } from 'electron';
import chalk from 'chalk';
import { DebugMain } from '../shared/DebugLogger';
import { LogContext, LogType } from '../types/enums';

DebugMain.events.on('logEntryAdded', (message: string, logType: LogType) => {
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

ipcMain.on('logEntryFromRenderer', (event: IpcMainEvent, message: string, logType: LogType, contextType?: LogContext, context?: string) => {
  DebugMain.appendToLog(message, logType, contextType, context);
});
