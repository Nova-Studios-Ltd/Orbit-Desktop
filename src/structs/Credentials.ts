interface ICredentialsProps {
  email?: string,
  username?: string,
  password?: string,
  address?: string
}

export default class Credentials {
  email?: string;
  username?: string;
  password?: string;
  address?: string;

  constructor(props: ICredentialsProps) {
    this.email = props.email;
    this.username = props.username;
    if (props.password != undefined)
      this.password = props.password;
    this.address = props.address;
  }
}
