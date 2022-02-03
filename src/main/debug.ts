import EventEmitter from "events";
import { LogContext, LogType } from "../types/enums";

class DebugLogger {
  private logBuffer: string[];
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

  appendToLog(message: (string | unknown), logType: LogType, contextType?: LogContext, context?: string) {
    let _message = message;
    let _contextType = contextType;
    let _logType = logType;
    if (contextType == null) _contextType = LogContext.Default;
    if (typeof(_message) != "string") {
      try {
        _message = JSON.stringify(_message)
      }
      catch {
        _message = "!! LOGGING ERROR !! => Unable to stringify object to printable string";
        _logType = LogType.Error;
      }
    }
    let finalMessage = `[${_contextType}] ${_logType} => ${_message}`;
    if (context != null && context?.length > 0) finalMessage = finalMessage.concat(" ", `(${context})`);

    finalMessage = `${new Date().toISOString()} ${finalMessage}`

    this.logBuffer.push(finalMessage);
    this.events.emit("logEntryAdded", finalMessage, _logType);
  }

  Error(message: (string | unknown), context?: string) {
    this.appendToLog(message, LogType.Error, LogContext.Main, context);
  }

  Warn(message: (string | unknown), context?: string) {
    this.appendToLog(message, LogType.Warn, LogContext.Main, context);
  }

  Success(message: (string | unknown), context?: string) {
    this.appendToLog(message, LogType.Success, LogContext.Main, context);
  }

  Log(message: (string | unknown), context?: string) {
    this.appendToLog(message, LogType.Info, LogContext.Main, context);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LogDump(_path: string) {
    // Send event to ipcMain to write file
  }
}

export const Debug = new DebugLogger();
