/* eslint-disable @typescript-eslint/no-unused-vars */

import { Ref } from 'react'

// Page Props

export interface ChatPageProps {

}

// Component Props

export interface UIHeaderProps {
  caption: string,
  icon: any,
  onClick: Function,
  misc: any
}

export interface LoginFormProps {
  init: Function
}

export interface RegisterFormProps {

}

export interface FormHeaderProps {
  heading: string,
  body: string
}

export interface FormTextFieldProps {
  handler: any,
  id: string,
  classNames: string,
  label: string,
  required?: boolean,
  sensitive?: boolean
}

export interface FormStatusFieldProps {
  message: string,
  type: string
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
