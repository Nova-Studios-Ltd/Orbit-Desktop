import type FormStatusTuple from "structs/FormStatusTypes";

export interface IChipTextFieldState {
  selectedItem: JSX.Element | undefined
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
