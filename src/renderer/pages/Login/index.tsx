import React from 'react';
import { Helmet } from 'react-helmet';
import { Button, TextField, Typography } from '@mui/material/';

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    console.log(event.target.value)
    event.preventDefault();
  }

  render() {
    return (
      <form className="Login_Form_Container">
        <Typography className="Login_Form_Item" variant="h4">Nova Chat 3.0</Typography>
        <Typography className="Login_Form_Item" variant="body1">Welcome!</Typography>
        <TextField className="Login_Form_Item" label="Username" required variant="outlined" />
        <TextField className="Login_Form_Item" label="Password" required variant="outlined" />
        <br />
        <TextField className="Login_Form_Item" label="Server Address" required variant="outlined" />
        <Button className="Login_Form_Item" variant="outlined">Login</Button>
      </form>
    );
  }
}

export default function Login() {

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
