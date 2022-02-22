import type Channel from "renderer/components/Channels/Channel";
import type Message from "renderer/components/Messages/Message";
import type MessageAttachment from "structs/MessageAttachment";
import type { ChannelType } from "types/enums";
import type { Dimensions } from "types/types";

export interface IChatPageState {
  Channels: Channel[]
  ChannelName: string,
  SelectedChannel: string,
  IsChannelSelected: boolean,
  Messages: Message[],
  AttachmentList: MessageAttachment[],
  CreateChannelDialogChannelName: string,
  CreateChannelDialogRecipientsRaw: string,
  CreateChannelDialogRecipients: {[username: string]: string},
  CreateChannelDialogVisible: boolean,
  CreateChannelDialogChannelType: ChannelType,
  CreateChannelDialogRecipientAvatarSrc: string,
  ImageViewerOpen: boolean,
  ImageViewerSrc: string,
  ImageViewerDimensions: Dimensions
}
