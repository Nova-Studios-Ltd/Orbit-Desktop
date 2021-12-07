import { ipcMain, IpcMainEvent } from 'electron';
import { DebugMain } from '../shared/DebugLogger';
import { LogContext, LogType } from '../types/enums';

DebugMain.events.on('logEntryAdded', (message: string, logType: LogType) => {
  switch (logType) {
    case LogType.Error:
      console.error(message);
      break;
    case LogType.Warn:
      console.warn(message);
      break;
    case LogType.Success:
    case LogType.Info:
    default:
      console.log(message);
  }
});

ipcMain.on('logEntryFromRenderer', (event: IpcMainEvent, message: string, logType: LogType, contextType?: LogContext, context?: string) => {
  DebugMain.appendToLog(message, logType, contextType, context);
});
