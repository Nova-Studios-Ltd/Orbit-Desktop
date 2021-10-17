import React from 'react';
import { Helmet } from 'react-helmet';
import RegisterForm from './RegisterForm';

function Register() {

  return (
    <div className="">
      <Helmet>
        <title>Register</title>
      </Helmet>

      <RegisterForm />

    </div>
  );
}

export default Register;
