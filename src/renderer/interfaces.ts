/* eslint-disable @typescript-eslint/no-unused-vars */

import { FormEventHandler, ReactChildren, Ref } from 'react'
import FormStatusTuple, { FormStatusType } from 'renderer/components/Form/FormStatusTypes';

// Page Props

export interface IAuthPageProps {
  login?: Boolean,
  register?: Boolean,
}

export interface IChatPageProps {

}

// Generic Component Props

export interface IHeaderProps {
  caption: string,
  icon: any,
  onClick: Function,
  misc: any
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
  }
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

// Custom Instances

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
