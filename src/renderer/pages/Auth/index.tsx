import React from 'react';
import { Helmet } from 'react-helmet';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { AuthPageProps } from 'renderer/interfaces'

function LoginInit(form: LoginForm) {

}

function RegisterInit(form: RegisterForm) {

}

export default class AuthPage extends React.Component {
  formType: Number;

  constructor(props: AuthPageProps) {
    super(props);
    this.formType = (() => {
      if (props.register)
        return 1;
      else
        return 0;
    })();
  }

  render() {
    const title = this.formType == 1 ? "Register" : "Login";
    const form = this.formType == 1 ? <RegisterForm init={RegisterInit}/> : <LoginForm init={LoginInit}/>;

    return (
      <div className="Auth_Page_Container">
        <Helmet>
          <title>{title}</title>
        </Helmet>

        <div className="Auth_Page_Left">
          <div className="Auth_Page_Left_Art" />
        </div>

        {form}

      </div>
    );
  }
}
