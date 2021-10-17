import React from 'react';
import { Helmet } from 'react-helmet';
import LoginForm from './LoginForm';

function LoginInit(form: LoginForm) {

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

      <LoginForm init={LoginInit}/>

    </div>
  );
}

export default Login;
