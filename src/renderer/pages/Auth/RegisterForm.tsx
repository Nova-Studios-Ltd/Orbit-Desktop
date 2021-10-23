import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Button, Typography, Link } from '@mui/material/';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { LoginFormProps } from 'renderer/interfaces';
import AuthForm from 'renderer/components/Form/AuthForm';
import FormTextField from 'renderer/components/Form/FormTextField';
import { IAuthForm } from 'renderer/interfaces'

class RegisterForm extends React.Component implements IAuthForm {
  constructor(props: LoginFormProps) {
    super(props);
    props.init(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {

  }

  handleChange(event: React.FormEvent<HTMLFormElement>) {

  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  render() {
    return (
      <AuthForm onSubmit={this.handleSubmit} headerHeading="Register" headerBody="Register for a NovaChat account.">
        <FormTextField id="username" classNames="Generic_Form_Item_Left" label="Username" description="Your new username." required onChange={this.handleChange} />
        <FormTextField id="password" classNames="Generic_Form_Item_Right" label="Password" description="Your new password." required sensitive onChange={this.handleChange} />
        <br />
        <Button className="Generic_Form_Item" variant="outlined" type="submit">Register</Button>
        <Typography className="Generic_Form_Item" variant="body1">Already have an account? <Link href="/login">Log In</Link></Typography>
      </AuthForm>
    );
  }
}

export default RegisterForm;
