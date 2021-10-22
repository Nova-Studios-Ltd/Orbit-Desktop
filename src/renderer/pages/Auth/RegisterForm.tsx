import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Button, Typography, Link } from '@mui/material/';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { LoginFormProps } from 'renderer/interfaces';
import AuthForm from 'renderer/components/Form/AuthForm';
import FormTextField from 'renderer/components/Form/FormTextField';

class RegisterForm extends React.Component {
  constructor(props: LoginFormProps) {
    super(props);
    props.init(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {

  }

  handleChange(event: any) {

  }

  handleSubmit(event: any) {

  }

  render() {
    return (
      <AuthForm onSubmit={this.handleSubmit}>
        <Typography className="Generic_Form_Item" variant="body1">Already have an account? <Link href="/login">Log In</Link></Typography>
      </AuthForm>
    );
  }
}

export default RegisterForm;
