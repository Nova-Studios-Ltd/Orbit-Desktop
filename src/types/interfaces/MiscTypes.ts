export interface IMessageDeleteRequestArgs {
  channelID: string,
  messageID: string
}

export interface IOpenFileDialogResults {
  path: string,
  contents?: Buffer
}
