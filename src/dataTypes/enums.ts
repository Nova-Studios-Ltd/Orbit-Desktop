export enum FormAuthStatusType {
  success,
  incorrectUsername,
  incorrectPassword,
  genericIncorrectUsernamePassword,
  networkTimeout,
  serverError,
  unknown
}

export enum ToastStausType {
  info = 'info',
  success = 'success',
  warning = 'warning',
  error = 'error'
}
