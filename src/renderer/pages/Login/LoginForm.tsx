import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Button, TextField, Typography, Link } from '@mui/material/';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import '../../interfaces';
import { Authenticate, Navigate } from '../../helpers';
import Credentials from '../../Credentials';

function FormHeader({heading, body} : FormHeaderProps)
{
  return (
    <div>
    <Typography className="Login_Form_Item" variant="h4">{heading}</Typography>
    <Typography className="Login_Form_Item" variant="body1">{body}</Typography>
  </div>
  );
}

class FormStatusField extends React.Component {
  constructor(props: FormStatusFieldProps) {
    super(props);
    this.state = {message: props.message, type: props.type};
  }

  getType()
  {
    const { type } = this.state;
    switch (String(type).toLowerCase())
    {
      case "info":
        return "#000000"
      case "warn":
        return "#f2c41d"
      case "error":
        return "#ff0011"
      default:
        return "#000000"
    }
  }

  update(message: string, type: string) {
    this.setState({"message": message, "type": type});
  }

  render() {
    const styles = {
      color: this.getType()
    }

    return (
      <div>
      <Typography className="Login_Form_Item" variant="body1" style={styles}>{this.state.message}</Typography>
    </div>
    );
  }
}

function FormTextField({handler, id, classNames, label, required, sensitive} : FormTextFieldProps) {

  const fieldType = sensitive ? "password" : "text";
  let finalClassNames = null;
  if (classNames != null) {
    finalClassNames = `Login_Form_Item ${classNames}`;
  }
  else {
    finalClassNames = "Login_Form_Item";
  }

  return (
    <TextField className={finalClassNames} name={id} label={label} type={fieldType} required={required} variant="outlined" onChange={handler} />
  );
}

class LoginForm extends React.Component {
  constructor(props: any) {
    super(props);
    props.init(this);
    this.state = {username: "", password: "", address: ""};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

  render() {
    const AdvancedOptionsAccordionStyles = `Login_Form_Item Login_Form_AdvancedOptionsAccordion`

    return (
      <form className="Login_Form_Container" onSubmit={this.handleSubmit}>
        <FormHeader heading="Nova Chat 3.0" body="Welcome!" />
        <FormStatusField />
        <FormTextField id="username" label="Username" required handler={this.handleChange} />
        <FormTextField id="password" label="Password" required sensitive handler={this.handleChange} />
        <br />
        <Accordion disabled className={AdvancedOptionsAccordionStyles}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body1">Advanced</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormTextField classNames="LoginFormAccordionOption" id="address" label="Server Address" handler={this.handleChange} />
          </AccordionDetails>
        </Accordion>
        <br />
        <Button className="Login_Form_Item" variant="outlined" type="submit">Login</Button>
        <br />
        <Typography className="Login_Form_Item" variant="body1">Don&apos;t have an account? <Link style={{cursor: "pointer"}} onClick={() => {Navigate("/register", null);}}>Sign Up</Link></Typography>
      </form>
    );
  }
}

export default LoginForm;
