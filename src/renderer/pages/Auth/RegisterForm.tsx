import React, { ChangeEvent } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Button, Typography, Link } from '@mui/material/';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import AuthForm from 'renderer/components/Form/AuthForm';
import FormTextField from 'renderer/components/Form/FormTextField';
import { Navigate, Register, ipcRenderer, Manager } from 'shared/helpers';
import Credentials from 'structs/Credentials';
import FormStatusTuple from 'structs/FormStatusTypes';
import { FormStatusType } from 'types/enums';

interface IRegisterFormState {
  email: string,
  username: string,
  password: string,
  address: string,
  status: FormStatusTuple
}

class RegisterForm extends React.Component {
  state: IRegisterFormState;

  constructor(props: never) {
    super(props);

    this.state = { email: '', username: '', password: '', address: '', status: new FormStatusTuple(undefined, undefined)}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    this.setState({[name]: value});
  }

  async handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { email, username, password, address } = this.state;
    if (!new RegExp(/^([a-zA-Z0-9]*@[a-zA-Z0-9]*\.[a-zA-Z0-9.]*)/g).test(email))
    {
      event.preventDefault();
      this.updateStatus(`'${email}' is not a valid email address. Please enter a correct one and try again`, FormStatusType.error);
      return;
    }
    Register(new Credentials({email, username, password: await ipcRenderer.invoke('SHA256HASH', password), address})).then(async (result) => {
      switch (result) {
        case true:
          this.updateStatus('Registered Successfully! Taking you to the login page...', FormStatusType.success);
          await new Promise(resolve => setTimeout(resolve, 2000));
          Navigate('/login', null);
          break;
        case false:
          this.updateStatus('Error registering for account. Please check your account details and try again.', FormStatusType.error);
          break;
      }
    });
  }

  updateStatus(message: string, type: FormStatusType) {
    this.setState({ status: new FormStatusTuple(message, type) });
  }

  render() {
    const AdvancedOptionsAccordionStyles = `Generic_Form_Item Login_Form_AdvancedOptionsAccordion`;

    return (
      <AuthForm onSubmit={this.handleSubmit} headerHeading={`${Manager.AppName} ${Manager.AppVersion}`} headerBody={`Register for a ${Manager.AppName} account.`} status={this.state.status}>
        <FormTextField id='email' label='Email' placeholder='Your Email Address' description='This will be used when signing in, and for account-related operations.' autoFocus required onChange={this.handleChange} />
        <FormTextField id='username' label='Username' placeholder='Your New username' required onChange={this.handleChange} />
        <FormTextField id='password' label='Password' placeholder='Your New password' required sensitive onChange={this.handleChange} />
        <br />
        <Typography className='Generic_Form_Item' sx={{color: 'red'}} variant='caption'>Warning: Due to end to end encryption, if you forget your password, you will lose your messages, so please keep your password stored somewhere safe (e.g. write it down or use a password manager).</Typography>
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
        <Typography className='Generic_Form_Item' variant='body1'>Already have an account? <Link className='AuthForm_Link' onClick={() => {Navigate('/login', null);}}>Log In</Link></Typography>
      </AuthForm>
    );
  }
}

export default RegisterForm;
