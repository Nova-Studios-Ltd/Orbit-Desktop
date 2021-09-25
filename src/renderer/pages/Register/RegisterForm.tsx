import React from 'react';
import { Button, TextField, Typography, Link } from '@mui/material/';
import '../Login/interfaces';
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

function FormStatusField({message, type} : FormStatusFieldProps)
{
  function getType()
  {
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

  const styles = {
    color: getType()
  }

  return (
    <div>
    <Typography className="Login_Form_Item" variant="body1" style={styles}>{message}</Typography>
  </div>
  );
}

function FormTextField({handler, id, label, required, sensitive} : FormTextFieldProps) {

  const fieldType = sensitive ? "password" : "text";

  return (
    <TextField className="Login_Form_Item" name={id} label={label} type={fieldType} required={required} variant="outlined" onChange={handler} />
  );
}

class RegisterForm extends React.Component {
  constructor(props: any) {
    super(props);
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
    return (
      <form className="Login_Form_Container" onSubmit={this.handleSubmit}>
        <FormHeader heading="Nova Chat 3.0" body="Welcome!" />
        <FormStatusField message="" type="info" />
        <FormTextField id="username" label="Username" required handler={this.handleChange} />
        <FormTextField id="password" label="Password" required sensitive handler={this.handleChange} />
        <br />
        <FormTextField id="address" label="Server Address" required handler={this.handleChange} />
        <Button className="Login_Form_Item" variant="outlined" type="submit">Login</Button>
        <br />
        <Typography className="Login_Form_Item" variant="body1">Don't have an account? <Link href="/register">Sign Up</Link></Typography>
        <Button className="Login_Form_Item" variant="contained" onClick={() => {Navigate("/chat");}}>Bypass</Button>
      </form>
    );
  }
}

export default RegisterForm;
