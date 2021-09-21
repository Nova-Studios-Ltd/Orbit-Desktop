import React from 'react';
import { Helmet } from 'react-helmet';
import { Button, TextField, Typography } from '@mui/material/';
import './Interfaces';
import { useHistory, withRouter } from 'react-router';

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
        break;
      case "warn":
        return "#f2c41d"
        break;
      case "error":
        return "#ff0011"
        break;
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
  constructor(props) {
    super(props);
    this.state = {username: "", password: "", address: ""};
    this.history = this.props.history;
    this.location = this.props.location;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({[name]: value});
  }

  handleSubmit(event) {
    const { username, password, address } = this.state;
    console.log();
    this.Navigate("/chat");
    event.preventDefault();
  }

  Navigate(path: string)
  {
    this.history.push(path);
  }

  render() {
    return (
      <form className="Login_Form_Container" onSubmit={this.handleSubmit}>
        <FormHeader heading="Nova Chat 3.0" body="Welcome!" />
        <FormStatusField message="" type="info" />
        <FormTextField id="username" label="Username" required handler={this.handleChange} />
        <FormTextField id="password" label="Password" sensitive required handler={this.handleChange} />
        <br />
        <FormTextField id="address" label="Server Address" required handler={this.handleChange} />
        <Button className="Login_Form_Item" variant="outlined" type="submit">Login</Button>
      </form>
    );
  }
}

function Login() {

  return (
    <div className="Login_Page_Container">
      <Helmet>
        <title>Login</title>
      </Helmet>

      <div className="Login_Page_Left">
        <div className="Login_Page_Left_Art" />
      </div>

      <LoginForm />

    </div>
  );
}

export default withRouter(Login);
