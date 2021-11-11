import React from 'react';
import { Helmet } from 'react-helmet';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { IAuthPageProps } from 'types/interfaces'
import GLOBALS from 'shared/globals';
import { ConductLogin, SetAuth, GetHistoryState } from 'shared/helpers';

function LoginInit(form: LoginForm) {
  if (GetHistoryState() != null && GetHistoryState().failed) return;
  ConductLogin();
}

function RegisterInit(form: RegisterForm) {

}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

// Random Experiemnt stuff
function GenerateRandomColor() {
  var r = getRandomInt(0, 255);
  var g = getRandomInt(0, 255);
  var b = getRandomInt(0, 255);
  return rgbToHex(r, g, b);
}

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export default class AuthPage extends React.Component {
  formType: Number;

  constructor(props: IAuthPageProps) {
    super(props);
    this.formType = (() => {
      if (props.register)
        return 1;
      else
        return 0;
    })();
  }

  render() {
    const title = this.formType == 1 ? 'Register' : 'Login';
    const form = this.formType == 1 ? <RegisterForm init={RegisterInit}/> : <LoginForm init={LoginInit}/>;
    const background = this.formType == 1 ? 'Register_Page_Container_Type' : 'Login_Page_Container_Type' ;
    const AuthPageContainerClassNames = `Auth_Page_Container ${background}`

    const st = {
      backgroundImage: `linear-gradient(43deg, ${GenerateRandomColor()} 0%, ${GenerateRandomColor()} 46%, ${GenerateRandomColor()} 100%)`,
    };

    return (
      <div className={AuthPageContainerClassNames} style={st}>
        <Helmet>
          <title>{title}</title>
        </Helmet>

        <div className='Auth_Page_Left' />

        {form}

      </div>
    );
  }
}
