import type { IpcRenderer } from "electron";
import { LogContext, LogType } from "types/enums";

export class DebugLogger {
  private ipcRendererObject: IpcRenderer;

  constructor(ipcRenderer: IpcRenderer) {
    this.ipcRendererObject = ipcRenderer;
    this.sendLogMessageToMain = this.sendLogMessageToMain.bind(this);
    this.Error = this.Error.bind(this);
    this.Warn = this.Warn.bind(this);
    this.Success = this.Success.bind(this);
    this.Log = this.Log.bind(this);
    this.LogDump = this.LogDump.bind(this);
  }

  private sendLogMessageToMain(message: (string | unknown), logType: LogType, context?: string) {
    this.ipcRendererObject.send('logEntryFromRenderer', message, logType, context);
  }

  Error(message: (string | unknown), context?: string) {
    this.sendLogMessageToMain(message, LogType.Error, context);
  }

  Warn(message: (string | unknown), context?: string) {
    this.sendLogMessageToMain(message, LogType.Warn, context);
  }

  Success(message: (string | unknown), context?: string) {
    this.sendLogMessageToMain(message, LogType.Success, context);
  }

  Log(message: (string | unknown), context?: string) {
    this.sendLogMessageToMain(message, LogType.Info, context);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LogDump(_path: string) {
    // Send event to ipcMain to write file
  }
}
