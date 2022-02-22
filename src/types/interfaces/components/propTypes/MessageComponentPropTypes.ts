import type { Dimensions } from "types/types";
import type Message from "renderer/components/Messages/Message";
import type MessageAttachment from "structs/MessageAttachment";

export interface IMessageProps {
  message_Id: string,
  author_UUID: string,
  author: string,
  content: string,
  iv: string,
  encryptedKeys: { [key: string] : string; },
  timestamp: string,
  editedTimestamp: string,
  edited: boolean,
  avatar: string,
  attachments: IAttachmentProps[],
  onUpdate: () => void;
  onImageClick?: (src: string, dimensions: Dimensions) => void;
}

export interface IAttachmentProps {
  contentUrl: string,
  content: Uint8Array,
  filename: string,
  size: number,
  contentWidth: number,
  contentHeight: number
}

export interface IMessageMediaProps {
  src: string,
  message?: string,
  content?: Uint8Array
  size?: number;
  dimensions?: Dimensions,
  onImageClick?: (src: string, dimensions: Dimensions) => void;
}

export interface IFileUploadSummaryProps {
  files: MessageAttachment[],
  onRemoveAttachment: (id: string) => void
}

export interface IMessageCanvasProps {
  messages: Message[],
  isChannelSelected: boolean,
  onImageClick?: (src: string, dimensions: Dimensions) => void,
  onCanvasScroll?: (yIndex: number, oldestMessageID: string) => void
}

export interface IMessageInputProps {
  onAddAttachment: (attachment: MessageAttachment) => void,
  onMessagePush: (message: string) => void
}
