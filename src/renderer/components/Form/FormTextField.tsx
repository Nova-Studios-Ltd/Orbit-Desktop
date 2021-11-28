import React, { Ref } from 'react';
import { TextField } from '@mui/material';
import { IFormTextFieldProps } from 'types/interfaces';

export default class FormTextField extends React.Component {
  id: string;
  classNames: string;
  label: string;
  description?: string;
  required?: boolean;
  sensitive?: boolean;
  onChange?: Function;

  constructor(props: IFormTextFieldProps) {
    super(props);
    this.id = props.id || '';
    this.classNames = props.classNames || '';
    this.label = props.label || '';
    this.description = props.description || '';
    this.required = props.required || false;
    this.sensitive = props.sensitive || false;
    this.onChange = props.onChange || function(){};
  }

  render() {
    const fieldType = this.sensitive ? 'password' : 'text';
    let finalClassNames = 'Generic_Form_Item Form_Text_Field';
    if (this.classNames.length > 0) {
      finalClassNames = finalClassNames.concat(' ', this.classNames);
    }

    return (
      <TextField className={finalClassNames} value={this.props.value} name={this.id} label={this.label} helperText={this.description} type={fieldType} required={this.required} variant='outlined' onChange={this.onChange} />
    );
  }
}
