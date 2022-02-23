import type MessageContent from "structs/MessageContent";

export interface IMessageState {
  editedMessage: string,
  isEditing: boolean,
  hasNonLinkText: boolean,
  links: MessageContent[],
  attachments: MessageContent[],
  anchorPos: { x: number, y: number},
  open: boolean
}

export interface IMessageCanvasState {

}

export interface IMessageInputState {
  message: string
}
