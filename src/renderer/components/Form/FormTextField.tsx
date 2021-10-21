import React from 'react';
import { TextField } from '@mui/material';
import { FormTextFieldProps } from 'renderer/interfaces';

export default class FormTextField extends React.Component {
  id: string
  classNames: string
  label: string
  required?: boolean
  sensitive?: boolean
  onChange: any

  constructor(props: FormTextFieldProps) {
    super(props);
    this.id = props.id;
    this.classNames = props.classNames;
    this.label = props.label;
    this.required = props.required;
    this.sensitive = props.sensitive;
    this.onChange = props.onChange;
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
      <TextField className={finalClassNames} name={this.id} label={this.label} type={fieldType} required={this.required} variant="outlined" onChange={this.onChange} />
    );
  }
}
