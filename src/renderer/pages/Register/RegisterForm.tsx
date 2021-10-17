import React from 'react';
import { Button, TextField, Typography, Link } from '@mui/material/';
import '../../interfaces';

class RegisterForm extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {};

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  FormTextField({handler, id, classNames, label, required, sensitive} : FormTextFieldProps) {

    const fieldType = sensitive ? "password" : "text";
    let finalClassNames = null;
    if (classNames != null) {
      finalClassNames = `Register_Form_Item ${classNames}`;
    }
    else {
      finalClassNames = "Register_Form_Item";
    }

    return (
      <TextField className={finalClassNames} name={id} label={label} type={fieldType} required={required} variant="outlined" onChange={handler} />
    );
  }

  handleSubmit(event: any) {

  }

  render() {
    return (
      <form className="Register_Form_Container" onSubmit={this.handleSubmit}>
        <this.FormTextField />
      </form>
    );
  }
}

export default RegisterForm;
