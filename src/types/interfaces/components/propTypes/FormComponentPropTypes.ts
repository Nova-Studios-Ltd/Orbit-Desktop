import type { SelectChangeEvent } from "@mui/material";
import type FormStatusTuple from "structs/FormStatusTypes";
import type { FormStatusType } from "types/enums";

export interface IAuthFormProps {
  headerHeading?: string,
  headerBody?: string,
  status?: FormStatusTuple,
  onSubmit?: React.FormEventHandler<HTMLFormElement>,
  children?: JSX.Element | JSX.Element[]
}

export interface IChipTextFieldProps {
  id: string,
  label: string,
  value?: string,
  classNames?: string,
  description?: string,
  autoFocus?: boolean,
  required?: boolean,
  sensitive?: boolean,
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export interface IFormDropdownProps {
  id: string,
  label: string,
  description?: string,
  value: string | undefined,
  onChange: (event: SelectChangeEvent<string>, child: React.ReactNode) => void;
}

export interface IFormHeaderProps {
  heading?: string,
  body?: string
}

export interface IFormStatusFieldProps {
  message?: string,
  type?: FormStatusType
}

export interface IFormTextFieldProps {
  id?: string,
  label?: string,
  placeholder?: string,
  value?: string,
  classNames?: string,
  description?: string,
  autoFocus?: boolean,
  required?: boolean,
  sensitive?: boolean,
  disabled?: boolean,
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}
