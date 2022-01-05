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

export interface IElectronRendererWindow {
  ipcRenderer: {
    send: (channel: string, ...data: unknown[]) => void,
    on: (channel: string, func: (...args: unknown[]) => void) => void,
    once: (channel: string, func: (...args: unknown[]) => void) => void,
    removeAllListeners: (channel: string) => void,
    invoke: (channel: string, ...data: unknown[]) => Promise<unknown>
  }
}
