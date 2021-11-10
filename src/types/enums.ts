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
