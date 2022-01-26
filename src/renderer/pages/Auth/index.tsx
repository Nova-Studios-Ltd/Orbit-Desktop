import React from 'react';
import { Helmet } from 'react-helmet';
import LoginForm from 'renderer/pages/Auth/LoginForm';
import RegisterForm from 'renderer/pages/Auth/RegisterForm';
import { Manager } from 'renderer/helpers';

interface IAuthPageProps {
  login?: boolean,
  register?: boolean,
  onNavigationDrawerOpened: (event: React.MouseEvent<HTMLButtonElement>, open?: boolean) => void
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

    this.GetRandomInt = this.GetRandomInt.bind(this);
    this.GenerateRandomColor = this.GenerateRandomColor.bind(this);
    this.HslToHex = this.HslToHex.bind(this);
  }

  GetRandomInt(min: number, max: number) {
    const mmin = Math.ceil(min);
    const mmax = Math.floor(max);
    return Math.floor(Math.random() * (mmax - mmin) + mmin); //The maximum is exclusive and the minimum is inclusive
  }

  GenerateRandomColor() {
    return this.HslToHex(this.GetRandomInt(0, 360), this.GetRandomInt(80, 100), 75);
  }

  HslToHex(h: number, s: number, l: number) {
    const ll = l / 100;
    const a = s * Math.min(ll, 1 - ll) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix '0' if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  render() {
    const title = this.formType == 1 ? 'Register' : 'Login';
    const form = this.formType == 1 ? <RegisterForm /> : <LoginForm />;
    const background = this.formType == 1 ? 'Register_Page_Container_Type' : 'Login_Page_Container_Type' ;
    const AuthPageContainerClassNames = `Page Auth_Page_Container ${background}`;

    const st = {
      backgroundImage: `linear-gradient(${this.GetRandomInt(43, 150)}deg, ${this.GenerateRandomColor()} 0%, ${this.GenerateRandomColor()} 46%, ${this.GenerateRandomColor()} 100%)`,
    };

    return (
      <div className={AuthPageContainerClassNames} style={st}>
        <Helmet>
          <title>{`${Manager.AppName} ${Manager.AppVersion} - ${title}`}</title>
        </Helmet>
        <div className='Auth_Page_Left' />
        {form}
      </div>
    );
  }
}
