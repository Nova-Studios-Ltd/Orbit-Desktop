/* eslint-disable @typescript-eslint/no-unused-vars */

import type { MouseEventHandler, ReactChildren, ReactNode } from 'react'
import type { SelectChangeEvent, Theme } from '@mui/material';
import type { ClassNameMap, Styles } from '@mui/styles';
import type FormStatusTuple from 'structs/FormStatusTypes';
import type { ChannelType  } from 'types/enums';
import type ChannelView from 'renderer/components/Channels/ChannelView';
import type MessageCanvas from 'renderer/components/Messages/MessageCanvas';
import type Message from 'renderer/components/Messages/Message';
import type MessageAttachment from 'structs/MessageAttachment';
import type MessageContent from 'structs/MessageContent';
import type { DefaultTheme } from '@mui/system';

// Generic Component Props

export interface IMessageDeleteRequestArgs {
  channelID: string,
  messageID: string
}

export interface IImageViewerProps {

}

export interface IFileUploadSummaryProps {
  files: Array<MessageAttachment>,
  onRemoveAttachment(id: string): void
}

export interface IHybridListItem {
  className?: string,
  id: string,
  text: string,
  icon: any,
  onClick: MouseEventHandler<HTMLLIElement>;
}

export interface IFileUploadDialog {

}

export interface IFormDropdownProps {
  id: string,
  label: string,
  description?: string,
  value: any,
  onChange: (event: SelectChangeEvent<any>, child: ReactNode) => void;
}

export interface ISettingsSectionProps {
  title: string,
  children: Element | ReactNode
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

export interface IAppState {
  theme: Theme,
  styles: Styles<DefaultTheme, ClassNameMap<"@global">>
}

export interface IChatPageState {
  CanvasObject?: MessageCanvas,
  ChannelList?: ChannelView,
  ChannelName: string,
  AttachmentList: Array<MessageAttachment>,
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

export interface IMessageState {
  editedMessage: string,
  isEditing: boolean,
  hasNonLinkText: boolean,
  links: MessageContent[],
  attachments: MessageContent[],
  anchorEl: any,
  open: boolean
}

export interface IMessageCanvasState {
  messages: Array<Message>
}

export interface ISettingsPageState {
  UpdatedUser: boolean,
  confirmUserAccountDeletionDialogOpen: boolean,
  darkThemeEnabled: boolean
}

// Implementation Prototypes

export interface IAuthForm {
  handleChange: Function,
  handleSubmit: Function
}

export type Dimensions = {
  width: number,
  height: number
}
