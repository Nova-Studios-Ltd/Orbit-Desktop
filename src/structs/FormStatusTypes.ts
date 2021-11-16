import { FormStatusType } from 'types/enums';

export default class FormStatusTuple {
  message: string;
  type: FormStatusType;

  constructor(message?: string, type?: FormStatusType) {
    if (message != null)
    this.message = message;
    else
      this.message = '';

    if (type != null)
      this.type = type;
    else
      this.type = FormStatusType.default;

  }
}
