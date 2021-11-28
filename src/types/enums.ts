export enum FormAuthStatusType {
  success,
  incorrectUsername,
  incorrectPassword,
  genericIncorrectUsernamePassword,
  networkTimeout,
  serverError,
  unknown
}

export enum FormStatusType {
  default,
  info,
  success,
  warn,
  error
}

export enum NotificationStatusType {
  default,
  info,
  success,
  warning,
  error
}

export enum NotificationAudienceType {
  app,
  system,
  both,
  none
}

export enum WebSocketMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

export enum ContentType {
  EMPTY = '',
  JSON = 'application/json'
}

export enum ChannelType {
  User = 0,
  Group = 1,
  Default = 0
}

export enum Theme {
  Light,
  Dark
}
