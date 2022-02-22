/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IElectronRendererWindow {
  ipcRenderer: {
    send: (channel: string, ...data: any[]) => void,
    on: (channel: string, func: (...args: any[]) => void) => void,
    once: (channel: string, func: (...args: any[]) => void) => void,
    removeAllListeners: (channel: string) => void,
    invoke: (channel: string, ...data: any[]) => Promise<any>,
    sendSync: (channel: string, ...data: any[]) => any;
  }
}

export interface IEWindow extends Window {
  electron: IElectronRendererWindow;
}
