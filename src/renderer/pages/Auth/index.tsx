import React from 'react';
import { Helmet } from 'react-helmet';
import LoginForm from 'renderer/pages/Auth/LoginForm';
import RegisterForm from 'renderer/pages/Auth/RegisterForm';
import type { IAuthPageProps } from 'types/interfaces'
import { ConductLogin } from 'shared/helpers';
import GLOBALS from 'shared/globals';

function LoginInit() {
  ConductLogin();
}

function RegisterInit() {

}

function getRandomInt(min: number, max: number) {
  const mmin = Math.ceil(min);
  const mmax = Math.floor(max);
  return Math.floor(Math.random() * (mmax - mmin) + mmin); //The maximum is exclusive and the minimum is inclusive
}

function hslToHex(h: number, s: number, l: number) {
  const ll = l / 100;
  const a = s * Math.min(ll, 1 - ll) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix '0' if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function GenerateRandomColor() {
  const h = getRandomInt(0, 360);
  const s = getRandomInt(80, 100);
  const l = 75;
  return hslToHex(h, s, l);
}

export default class AuthPage extends React.Component<IAuthPageProps> {
  formType: number;

  constructor(props: IAuthPageProps) {
    super(props);
    this.formType = (() => {
      if (props.register)
        return 1;
      return 0;
    })();
  }

  render() {
    const title = this.formType == 1 ? 'Register' : 'Login';
    const form = this.formType == 1 ? <RegisterForm init={RegisterInit}/> : <LoginForm init={LoginInit}/>;
    const background = this.formType == 1 ? 'Register_Page_Container_Type' : 'Login_Page_Container_Type' ;
    const AuthPageContainerClassNames = `Page Auth_Page_Container ${background}`;

    const st = {
      backgroundImage: `linear-gradient(${getRandomInt(43, 150)}deg, ${GenerateRandomColor()} 0%, ${GenerateRandomColor()} 46%, ${GenerateRandomColor()} 100%)`,
    };

    return (
      <div className={AuthPageContainerClassNames} style={st}>
        <Helmet>
          <title>{`${GLOBALS.appName} ${GLOBALS.appVersion} - ${title}`}</title>
        </Helmet>
        <div className='Auth_Page_Left' />
        {form}
      </div>
    );
  }
}
