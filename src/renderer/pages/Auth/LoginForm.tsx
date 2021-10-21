import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Button, Typography, Link } from '@mui/material/';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Authenticate, Navigate } from 'renderer/helpers';
import Credentials from 'main/Credentials';
import { LoginFormProps } from 'renderer/interfaces';
import AuthForm from 'renderer/components/Form/AuthForm';
import FormTextField from 'renderer/components/Form/FormTextField';
import FormStatusTuple, { FormStatusType } from 'renderer/components/Form/FormStatusTypes';

class LoginForm extends React.Component {
  constructor(props: LoginFormProps) {
    super(props);
    props.init(this);

    this.authCallback = this.authCallback.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {
    username: "" as string,
    password: "" as string,
    address: ""  as string,
    status: null as unknown as FormStatusTuple
  }

  handleChange(event: any) {
    const { name, value } = event.target;
    this.setState({[name]: value});
  }

  handleSubmit(event: any) {
    const { username, password, address } = this.state;
    Authenticate(new Credentials(username, password, address));
    event.preventDefault();
  }

  updateStatus(message: string, type: FormStatusType) {
    this.setState({ status: new FormStatusTuple(message, type) });
  }

  render() {
    const AdvancedOptionsAccordionStyles = `Generic_Form_Item Login_Form_AdvancedOptionsAccordion`

    return (
      <AuthForm onSubmit={this.handleSubmit} headerHeading="Nova Chat 3.0" headerBody="Welcome!" status={this.state.status}>
        <FormTextField id="username" label="Username" required onChange={this.handleChange} />
        <FormTextField id="password" label="Password" required sensitive onChange={this.handleChange} />
        <br />
        <Accordion disabled className={AdvancedOptionsAccordionStyles}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body1">Advanced</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormTextField classNames="LoginFormAccordionOption" id="address" label="Server Address" onChange={this.handleChange} />
          </AccordionDetails>
        </Accordion>
        <br />
        <Button className="Generic_Form_Item" variant="outlined" type="submit">Login</Button>
        <br />
        <Typography className="Generic_Form_Item" variant="body1">Don&apos;t have an account? <Link href="/register">Sign Up</Link></Typography>
      </AuthForm>
    );
  }
}

export default LoginForm;
