/* eslint-disable @typescript-eslint/no-unused-vars */

import { FormEventHandler, ReactChildren, Ref } from 'react'
import FormStatusTuple from 'structs/FormStatusTypes';
import { FormStatusType } from 'types/enums';
import { NotificationStatusType, NotificationAudienceType } from 'types/enums';
import UserData from 'structs/UserData';

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
  channelName: string,
  channelID: string,
  channelIcon?: string
}

export interface IChannelViewProps {
  init: Function
}

export interface IMessageProps {
  messageUUID: string,
  authorUUID: string,
  author: string,
  message: string,
  timestamp: string,
  avatarSrc: string,
  ref: Ref<any>
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
  playSound?: Boolean,
  notificationType?: NotificationStatusType,
  notificationAudience?: NotificationAudienceType
}

export interface IMessageDeleteRequestArgs {
  channelID: string,
  messageID: string
}

export interface IGenericDialogProps {
  title: string,
  children: ReactChildren
}

export interface IYesNoDialogProps {
  title: string,
  body: string
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

// Implementation Prototypes

export interface IAuthForm {
  handleChange: Function,
  handleSubmit: Function
}
