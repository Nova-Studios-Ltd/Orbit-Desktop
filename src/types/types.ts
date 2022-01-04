export type Dimensions = {
  width: number,
  height: number
}

export interface IMessageDeleteRequestArgs {
  channelID: string,
  messageID: string
}

export interface IUserData {
  username: string,
  uuid: string,
  token: string,
  discriminator: string,
  avatarSrc: string
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
