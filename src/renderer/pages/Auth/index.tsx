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

function GenerateRandomColor() {
  var h = getRandomInt(0, 360);
  var s = getRandomInt(80, 100);
  var l = 75;
  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
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
    const AuthPageContainerClassNames = `Auth_Page_Container ${background}`;

    const st = {
      backgroundImage: `linear-gradient(${getRandomInt(43, 150)}deg, ${GenerateRandomColor()} 0%, ${GenerateRandomColor()} 46%, ${GenerateRandomColor()} 100%)`,
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
