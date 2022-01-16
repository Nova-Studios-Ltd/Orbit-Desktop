import type { AESMemoryEncryptData, IAESMemoryEncryptData } from "main/encryptionClasses";

export type Dimensions = {
  width: number,
  height: number
}

export interface IUserData {
  username: string,
  uuid: string,
  token: string,
  discriminator: string,
  avatarSrc: string
}

export interface IUserLoginData {
  uuid: string,
  token: string,
  publicKey: string,
  key: IAESMemoryEncryptData
}

export interface IMessageDeleteRequestArgs {
  channelID: string,
  messageID: string
}

export interface IOpenFileDialogResults {
  path: string,
  contents?: Buffer
}

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
