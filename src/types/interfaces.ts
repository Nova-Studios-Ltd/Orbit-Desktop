/* eslint-disable @typescript-eslint/no-unused-vars */

import { FormEventHandler, MouseEvent, ReactChildren, Ref } from 'react'
import { SelectChangeEvent } from '@mui/material';
import FormStatusTuple from 'structs/FormStatusTypes';
import { ChannelType, FormStatusType, NotificationStatusType, NotificationAudienceType  } from 'types/enums';
import UserData from 'structs/UserData';
import ChannelView from 'renderer/components/Channels/ChannelView';
import MessageCanvas from 'renderer/components/Messages/MessageCanvas';
import Channel from 'renderer/components/Channels/Channel';

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
  children: ReactChildren
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
  innerRef: Ref<HTMLInputElement>,
  classNames?: string,
  label: string,
  description?: string,
  required?: boolean,
  sensitive?: boolean,
  onChange?: Function
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
  avatar: string
}

export interface IMessageImageProps {
  message: string,
  src: string
}

export interface IMessageCanvasProps {
  init: Function
}

export interface IMessageInputProps {
  init: Function,
  onMessagePush: Function
}

export interface IMessageContent {
  type: string,
  url: string
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

export interface IFormDropdownProps {
  id: string,
  label: string,
  description?: string,
  value: any,
  onChange: SelectChangeEvent<unknown>
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

export interface IRegisterFormProps {

}

// State

export interface IChatPageState {
  CanvasObject: MessageCanvas,
  ChannelList: ChannelView,
  CreateChannelDialogChannelName: string,
  CreateChannelDialogRecipients: {[username: string]: string},
  CreateChannelDialogVisible: boolean,
  CreateChannelDialogChannelType: ChannelType
}

export interface IChannelViewState {
  channels: Channel[],
}

export interface IChannelState {
  anchorEl: any,
  open: boolean
}

// Implementation Prototypes

export interface IAuthForm {
  handleChange: Function,
  handleSubmit: Function
}
