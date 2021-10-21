export enum FormStatusType {
  info,
  warn,
  error,
  default
}

export default class FormStatusTuple {
  message: string;
  type: FormStatusType;

  constructor(message: string, type: FormStatusType) {
    this.message = message;
    this.type = type;
  }
}
