import type { IpcRenderer } from "electron";
import EventEmitter from "events";
import { LogContext, LogType } from "../types/enums";

class DebugLogger {
  private logBuffer: Array<string>;
  events: EventEmitter;

  constructor() {
    this.logBuffer = [];
    this.events = new EventEmitter();
    this.appendToLog = this.appendToLog.bind(this);
    this.Error = this.Error.bind(this);
    this.Warn = this.Warn.bind(this);
    this.Success = this.Success.bind(this);
    this.Log = this.Log.bind(this);
    this.LogDump = this.LogDump.bind(this);
  }

  appendToLog(message: string, logType: LogType, contextType?: LogContext, context?: string) {
    if (contextType == null) contextType = LogContext.Default;
    let finalMessage = `[${contextType}] ${logType}: ${message}`;
    if (context != null && context?.length > 0) finalMessage = finalMessage.concat(' ', `(${context})`);

    finalMessage = `${new Date().toISOString()} ${finalMessage}`

    this.logBuffer.push(finalMessage);
    this.events.emit('logEntryAdded', finalMessage, logType);
  }

  Error(message: string, type?: LogContext, context?: string) {
    this.appendToLog(message, LogType.Error, type, context);
  }

  Warn(message: string, type?: LogContext, context?: string) {
    this.appendToLog(message, LogType.Warn, type, context);
  }

  Success(message: string, type?: LogContext, context?: string) {
    this.appendToLog(message, LogType.Success, type, context);
  }

  Log(message: string, type?: LogContext, context?: string) {
    this.appendToLog(message, LogType.Info, type, context);
  }

  LogDump(path: string) {
    // Send event to ipcMain to write file
  }
}

export class DebugRendererHandler {
  ipcRendererObject: IpcRenderer;

  constructor(ipcRenderer: IpcRenderer) {
    this.ipcRendererObject = ipcRenderer;
    this.sendLogMessageToMain = this.sendLogMessageToMain.bind(this);
    this.Error = this.Error.bind(this);
    this.Warn = this.Warn.bind(this);
    this.Success = this.Success.bind(this);
    this.Log = this.Log.bind(this);
    this.LogDump = this.LogDump.bind(this);
  }

  private sendLogMessageToMain(message: string, logType: LogType, contextType?: LogContext, context?: string) {
    this.ipcRendererObject.send('logEntryFromRenderer', message, logType, contextType, context);
  }

  Error(message: string, type?: LogContext, context?: string) {
    this.sendLogMessageToMain(message, LogType.Error, type, context);
  }

  Warn(message: string, type?: LogContext, context?: string) {
    this.sendLogMessageToMain(message, LogType.Warn, type, context);
  }

  Success(message: string, type?: LogContext, context?: string) {
    this.sendLogMessageToMain(message, LogType.Success, type, context);
  }

  Log(message: string, type?: LogContext, context?: string) {
    this.sendLogMessageToMain(message, LogType.Info, type, context);
  }

  LogDump(path: string) {
    // Send event to ipcMain to write file
  }
}

export const DebugMain = new DebugLogger();
