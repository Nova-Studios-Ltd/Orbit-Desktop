/* eslint-disable @typescript-eslint/no-unused-vars */

import { FormEventHandler, ReactChildren, Ref } from 'react'
import FormStatusTuple, { FormStatusType } from './components/Form/FormStatusTypes';

// Page Props

export interface AuthPageProps {
  login?: Boolean,
  register?: Boolean,
}

export interface ChatPageProps {

}

// Generic Component Props

export interface HeaderProps {
  caption: string,
  icon: any,
  onClick: Function,
  misc: any
}

export interface AuthFormProps {
  headerHeading?: string,
  headerBody?: string,
  status?: FormStatusTuple,
  onSubmit?: FormEventHandler<HTMLFormElement>,
  children?: JSX.Element|JSX.Element[]
}

export interface FormHeaderProps {
  heading?: string,
  body?: string
}

export interface FormTextFieldProps {
  id: string,
  classNames?: string,
  label: string,
  description?: string,
  required?: boolean,
  sensitive?: boolean,
  onChange?: Function
}

export interface FormStatusFieldProps {
  message?: string,
  type?: FormStatusType
}

export interface ChannelProps {
  channelName: string,
  channelID: string
}

export interface ChannelViewProps {
  init: Function
}

export interface MessageProps {
  uuid: string,
  author: string,
  message: string,
  avatarSrc: string,
  ref: Ref<any>
}

export interface MessageImageProps {
  message: string,
  src: string
}

export interface MessageCanvasProps {
  init: Function
}

export interface MessageInputProps {
  init: Function,
  onMessagePush: Function
}

// Custom Instances

// Custom Component Props

export interface LoginFormProps extends AuthFormProps {
  init: Function
}

export interface RegisterFormProps {

}

// Implementation Prototypes

export interface IAuthForm {
  handleChange: Function,
  handleSubmit: Function
}
