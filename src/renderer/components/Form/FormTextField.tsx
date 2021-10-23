import React from 'react';
import { TextField } from '@mui/material';
import { FormTextFieldProps } from 'renderer/interfaces';

export default class FormTextField extends React.Component {
  id: string;
  classNames?: string;
  label: string;
  description?: string;
  required?: boolean;
  sensitive?: boolean;
  onChange?: Function;

  constructor(props: FormTextFieldProps) {
    super(props);
    this.id = props.id || "";
    this.classNames = props.classNames || "";
    this.label = props.label || "";
    this.description = props.description || "";
    this.required = props.required || false;
    this.sensitive = props.sensitive || false;
    this.onChange = props.onChange || function(){};
  }

  render() {
    const fieldType = this.sensitive ? "password" : "text";
    let finalClassNames = null;
    if (this.classNames != null) {
      finalClassNames = `Generic_Form_Item ${this.classNames}`;
    }
    else {
      finalClassNames = "Generic_Form_Item";
    }

    return (
      <TextField className={finalClassNames} name={this.id} label={this.label} helperText={this.description} type={fieldType} required={this.required} variant="outlined" onChange={this.onChange} />
    );
  }
}
