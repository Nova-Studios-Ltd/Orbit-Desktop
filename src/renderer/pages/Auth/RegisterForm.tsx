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

    this.state = { username: "", password: "", address: ""}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {
    username: "" as string,
    password: "" as string,
    address: ""  as string
  }

  handleChange(event: React.FormEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    this.setState({[name]: value});
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    console.log(`Username: ${this.state.username}; Password: ${this.state.password}`);
    event.preventDefault();
  }

  render() {
    const AdvancedOptionsAccordionStyles = `Generic_Form_Item Login_Form_AdvancedOptionsAccordion`;

    return (
      <AuthForm onSubmit={this.handleSubmit} headerHeading="Nova Chat 3.0" headerBody="Register for a NovaChat account.">
        <FormTextField id="username" classNames="Generic_Form_Item_Left" label="Username" description="Your new username." required onChange={this.handleChange} />
        <FormTextField id="password" classNames="Generic_Form_Item_Right" label="Password" description="Your new password." required sensitive onChange={this.handleChange} />
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
        <Button className="Generic_Form_Item" variant="outlined" type="submit">Register</Button>
        <br />
        <Typography className="Generic_Form_Item" variant="body1">Already have an account? <Link href="/login">Log In</Link></Typography>
      </AuthForm>
    );
  }
}

export default RegisterForm;
