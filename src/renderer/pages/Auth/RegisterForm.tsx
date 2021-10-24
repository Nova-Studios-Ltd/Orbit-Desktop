import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Button, Typography, Link } from '@mui/material/';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { ILoginFormProps } from 'renderer/interfaces';
import AuthForm from 'renderer/components/Form/AuthForm';
import FormTextField from 'renderer/components/Form/FormTextField';
import { IAuthForm } from 'renderer/interfaces'
import { Navigate, Register } from 'renderer/helpers';
import Credentials from 'main/Credentials';
import FormStatusTuple, { FormStatusType } from 'renderer/components/Form/FormStatusTypes';

class RegisterForm extends React.Component implements IAuthForm {
  constructor(props: ILoginFormProps) {
    super(props);
    props.init(this);

    this.state = { email: '', username: '', password: '', address: '', status: new FormStatusTuple(undefined, undefined)}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {
    email: '' as string,
    username: '' as string,
    password: '' as string,
    address: ''  as string,
    status: new FormStatusTuple(undefined, undefined) as FormStatusTuple
  }

  handleChange(event: React.FormEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    this.setState({[name]: value});
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const { email, username, password, address } = this.state;
    Register(new Credentials({email: email, username: username, password: password, address: address})).then((result) => {
      switch (result) {
        case true:
          this.updateStatus('Registered Successfully!', FormStatusType.success);
          break;
        case false:
          this.updateStatus('Error registering for account. Please check your account details and try again.', FormStatusType.error);
          break;
      }
    });
    event.preventDefault();
  }

  updateStatus(message: string, type: FormStatusType) {
    this.setState({ status: new FormStatusTuple(message, type) });
  }

  render() {
    const AdvancedOptionsAccordionStyles = `Generic_Form_Item Login_Form_AdvancedOptionsAccordion`;

    return (
      <AuthForm onSubmit={this.handleSubmit} headerHeading='Nova Chat 3.0' headerBody='Register for a NovaChat account.' status={this.state.status}>
        <FormTextField id='email' label='Email' description='Your email address. This will be used when signing in, and for account-related operations.' required onChange={this.handleChange} />
        <FormTextField id='username' label='Username' description='Your new username.' required onChange={this.handleChange} />
        <FormTextField id='password' label='Password' description='Your new password.' required sensitive onChange={this.handleChange} />
        <br />
        <Accordion disabled className={AdvancedOptionsAccordionStyles}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant='body1'>Advanced</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormTextField classNames='LoginFormAccordionOption' id='address' label='Server Address' onChange={this.handleChange} />
          </AccordionDetails>
        </Accordion>
        <br />
        <Button className='Generic_Form_Item' variant='outlined' type='submit'>Register</Button>
        <br />
        <Typography className='Generic_Form_Item' variant='body1'>Already have an account? <Link href='/login'>Log In</Link></Typography>
      </AuthForm>
    );
  }
}

export default RegisterForm;
