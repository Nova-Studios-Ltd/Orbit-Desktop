import React, { ChangeEvent } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Button, Typography, Link } from '@mui/material/';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Authenticate, Navigate } from 'shared/helpers';
import Credentials from 'structs/Credentials';
import GLOBALS from 'shared/globals';
import AuthForm from 'renderer/components/Form/AuthForm';
import FormTextField from 'renderer/components/Form/FormTextField';
import FormStatusTuple from 'structs/FormStatusTypes';
import { FormAuthStatusType, FormStatusType } from 'types/enums';

interface ILoginFormProps {
  init(form: LoginForm): void
}

interface ILoginFormState {
  email: string,
  password: string,
  address: string,
  status: FormStatusTuple
}

class LoginForm extends React.Component<ILoginFormProps> implements IAuthForm {
  state: ILoginFormState;

  constructor(props: ILoginFormProps) {
    super(props);
    props.init(this);

    this.state = {email: '', password: '', address: '', status: new FormStatusTuple(undefined, undefined)}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    this.setState({[name]: value});
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const { email, password, address } = this.state;
    this.updateStatus('Attempting to log you in, please wait...', FormStatusType.info);
    Authenticate(new Credentials({email, password, address})).then((result: FormAuthStatusType) => {
      switch (result) {
        case FormAuthStatusType.success:
          this.updateStatus('Yay, logged in successfully! Redirecting...', FormStatusType.success);
          break;
        case FormAuthStatusType.genericIncorrectUsernamePassword:
          this.updateStatus('Incorrect Username or Password', FormStatusType.error);
          break;
        case FormAuthStatusType.networkTimeout:
          this.updateStatus('Unable to connect to server (try checking your internet connection, or making sure the address is correct)', FormStatusType.error);
          break;
        case FormAuthStatusType.serverError:
          this.updateStatus('Uhh, the server seems to have encountered an error. Try again?', FormStatusType.error);
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
      <AuthForm onSubmit={this.handleSubmit} headerHeading={`${GLOBALS.appName} ${GLOBALS.appVersion}`} headerBody='Welcome! Please log in to continue.' status={this.state.status}>
        <FormTextField id='email' label='Email' autoFocus required onChange={this.handleChange} />
        <FormTextField id='password' label='Password' required sensitive onChange={this.handleChange} />
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
        <Button className='Generic_Form_Item' variant='outlined' type='submit'>Login</Button>
        <br />
        <Typography className='Generic_Form_Item' variant='body1'>Don&apos;t have an account? <Link className='AuthForm_Link' onClick={() => {Navigate('/register', null);}}>Sign Up</Link></Typography>
      </AuthForm>
    );
  }
}

export default LoginForm;
