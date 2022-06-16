export interface IChannelState {
  contextMenuAnchorPos: { x: number, y: number},
  contextMenuOpen: boolean,
  confirmChannelDeletionDialogOpen: boolean,
  editDialogOpen: boolean,
  editDialogChannelName: string,
  editDialogChannelIconPath: string | undefined,
  editDialogChannelIconPreview: string | undefined,
  editDialogChannelRecipients: string | undefined
}

export interface IChannelViewState {
  selectedTab: number
}
