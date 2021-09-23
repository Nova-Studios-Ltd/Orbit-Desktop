import React from 'react';
import { withRouter } from 'react-router';
import { Button, TextField, Typography } from '@mui/material/';
import './interfaces';

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

class LoginForm extends React.Component {

  history: History;
  location: Location;

  constructor(props: any) {
    super(props);
    this.state = {username: "", password: "", address: ""};
    this.history = props.history;
    this.location = props.location;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: any) {
    const { name, value } = event.target;
    this.setState({[name]: value});
  }

  handleSubmit(event: any) {
    const { username, password, address } = this.state;
    console.log(`Username: ${username}, Password: ${password}, Address: ${address}`);
    this.Navigate("/chat");
    event.preventDefault();
  }

  Navigate(path: string)
  {
    try {
      this.history.push(path);
      console.log(`Current URL: ${window.location.href}`)
    }
    catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <form className="Login_Form_Container" onSubmit={this.handleSubmit}>
        <FormHeader heading="Nova Chat 3.0" body="Welcome!" />
        <FormStatusField message="" type="info" />
        <FormTextField id="username" label="Username" handler={this.handleChange} />
        <FormTextField id="password" label="Password" sensitive handler={this.handleChange} />
        <br />
        <FormTextField id="address" label="Server Address" handler={this.handleChange} />
        <Button className="Login_Form_Item" variant="outlined" type="submit">Login</Button>
      </form>
    );
  }
}

export default withRouter(LoginForm);
