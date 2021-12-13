/* eslint-disable @typescript-eslint/no-unused-vars */

import type { FormEventHandler, MouseEvent, ReactChildren } from 'react'
import type { SelectChangeEvent } from '@mui/material';
import type FormStatusTuple from 'structs/FormStatusTypes';
import type { ChannelType, FormStatusType, NotificationStatusType, NotificationAudienceType  } from 'types/enums';
import type UserData from 'structs/UserData';
import type ChannelView from 'renderer/components/Channels/ChannelView';
import type MessageCanvas from 'renderer/components/Messages/MessageCanvas';
import type Channel from 'renderer/components/Channels/Channel';
import type Message from 'renderer/components/Messages/Message';
import MessageAttachment from 'structs/MessageAttachment';
import MessageContent from 'structs/MessageContent';

// Page Props

export interface IAuthPageProps {
  login?: Boolean,
  register?: Boolean,
}

export interface IChatPageProps {

}

export interface ISettingsPageProps {

}

// Generic Component Props

export interface IHeaderProps {
  caption: string,
  icon: any,
  onClick: Function,
  children: Element[]
}

export interface IAuthFormProps {
  headerHeading?: string,
  headerBody?: string,
  status?: FormStatusTuple,
  onSubmit?: FormEventHandler<HTMLFormElement>,
  children?: JSX.Element|JSX.Element[]
}

export interface IFormHeaderProps {
  heading?: string,
  body?: string
}

export interface IFormTextFieldProps {
  id: string,
  value: string,
  classNames?: string,
  label: string,
  description?: string,
  autoFocus?: boolean,
  required?: boolean,
  sensitive?: boolean,
  onChange?: () => void
}

export interface IFormStatusFieldProps {
  message?: string,
  type?: FormStatusType
}

export interface IChannelProps {
  table_Id: string,
  owner_UUID: string,
  isGroup: boolean,
  groupName: string,
  channelName: string,
  clickedCallback: Function,
  channelIcon?: string,
  members: string[]
}

export interface IChannelViewProps {
  init: Function
}

export interface IMessageProps {
  message_Id: string,
  author_UUID: string,
  author: string,
  content: string,
  timestamp: string,
  editedTimestamp: string,
  edited: boolean,
  avatar: string,
  attachments: IAttachmentProps[],
  onUpdate: Function
}

export interface IAttachmentProps {
  contentUrl: string,
  filename: string,
  size: number,
  contentWidth: number,
  contentHeight: number
}

export interface IMessageMediaProps {
  message: string,
  src: string,
  dimensions?: Dimensions
}

export interface IMessageCanvasProps {
  init: Function
}

export interface IMessageInputProps {
  init: Function,
  onMessagePush: (message: string, attachments: MessageAttachment[]) => void
}

export interface IMessageContent {
  type: string,
  url: string,
  dimensions?: Dimensions
}

export interface IUserDropdownMenu {
  menuFunctions: {
    logout: Function
  },
  userData: UserData
}

export interface IUserDropdownMenuFunctions {
  logout: Function
}

export interface ICredentialsProps {
  email?: string,
  username?: string,
  password?: string,
  address?: string
}

export interface INotificationProps {
  title?: string,
  body?: string,
  playSound?: boolean,
  notificationType?: NotificationStatusType,
  notificationAudience?: NotificationAudienceType
}

export interface IMessageDeleteRequestArgs {
  channelID: string,
  messageID: string
}

export interface IGenericDialogProps {
  title: string,
  children: ReactChildren,
  actions: ReactChildren
}

export interface IYesNoDialogProps {
  title: string,
  body: string,
  show: boolean,
  confirmButtonText?: string,
  denyButtonText?: string,
  onConfirm: MouseEvent<HTMLButtonElement, MouseEvent>,
  onDeny: MouseEvent<HTMLButtonElement, MouseEvent>,
}

export interface IImageViewerProps {

}

export interface IHybridListItem {
  className: string,
  id: string,
  text: string,
  icon: any,
  onClick: Function
}

export interface IFileUploadDialog {

}

export interface IFormDropdownProps {
  id: string,
  label: string,
  description?: string,
  value: any,
  onChange: SelectChangeEvent<unknown>
}

export interface ISettingsSectionProps {
  title: string,
  children: ReactChildren
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
    send(channel: string, ...data: any[]): void,
    on(channel: string, func: Function): void,
    once(channel: string, func: Function): void,
    removeAllListeners(channel: string): void,
    invoke(channel: string, ...data: any[]): Promise<any>
  }
}

// Custom Component Props

export interface ILoginFormProps extends IAuthFormProps {
  init: Function
}

export interface IRegisterFormProps extends IAuthFormProps {
  init: Function
}

// State

export interface IChatPageState {
  CanvasObject?: MessageCanvas,
  ChannelList?: ChannelView,
  ChannelName: string,
  CreateChannelDialogChannelName: string,
  CreateChannelDialogRecipients: {[username: string]: string},
  CreateChannelDialogVisible: boolean,
  CreateChannelDialogChannelType: ChannelType,
  CreateChannelDialogRecipientAvatarSrc: string,
  NavigationDrawerOpen: boolean
}

export interface ILoginFormState {
  email: string,
  password: string,
  address: string,
  status: FormStatusTuple
}

export interface IRegisterFormState {
  email: string,
  username: string,
  password: string,
  address: string,
  status: FormStatusTuple
}

export interface IChannelViewState {
  channels: Channel[],
}

export interface IChannelState {
  contextMenuAnchorEl: any,
  contextMenuOpen: boolean,
  confirmChannelDeletionDialogOpen: boolean
}

export interface IMessageState {
  editedMessage: string,
  isEditing: boolean,
  hasNonLinkText: boolean,
  links: MessageContent[],
  attachments: MessageContent[],
  anchorEl: any,
  open: boolean
}

export interface IMessageInputState {
  message: string,
  attachments: MessageAttachment[]
}

export interface IMessageCanvasState {
  messages: Array<Message>
}

export interface IUserDropdownMenuState {
  anchorEl: any,
  open: boolean
}

export interface ISettingsPageState {
  confirmUserAccountDeletionDialogOpen: boolean
}

// Implementation Prototypes

export interface IAuthForm {
  handleChange: Function,
  handleSubmit: Function
}

export type Dimensions = {
  width: number | string,
  height: number | string
}
