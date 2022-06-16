import React from "react";
import { TextField } from "@mui/material";

import type { IFormTextFieldProps } from "types/interfaces/components/propTypes/FormComponentPropTypes";

export default class FormTextField extends React.Component<IFormTextFieldProps> {
  id: string;
  classNames: string;
  label: string;
  placeholder?: string;
  description?: string;
  autoFocus?: boolean;
  required?: boolean;
  sensitive?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  constructor(props: IFormTextFieldProps) {
    super(props);
    this.id = props.id || "";
    this.classNames = props.classNames || "";
    this.label = props.label || "";
    this.placeholder = props.placeholder || "";
    this.description = props.description || "";
    this.autoFocus = props.autoFocus || false;
    this.required = props.required || false;
    this.sensitive = props.sensitive || false;
    this.disabled = props.disabled || false;
    this.onChange = props.onChange || undefined;
  }

  render() {
    const fieldType = this.sensitive ? "password" : "text";
    let finalClassNames = "Generic_Form_Item Form_Text_Field";
    if (this.classNames.length > 0) {
      finalClassNames = finalClassNames.concat(" ", this.classNames);
    }

    return (
      <TextField className={finalClassNames} FormHelperTextProps={{ className: "Form_Text_Field_Description" }} value={this.props.value} name={this.id} label={this.label} placeholder={this.placeholder} helperText={this.description} type={fieldType} required={this.required} variant="outlined" autoFocus={this.autoFocus} disabled={this.disabled} fullWidth onChange={this.onChange} />
    );
  }
}
