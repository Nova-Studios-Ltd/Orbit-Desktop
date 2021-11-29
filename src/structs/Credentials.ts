import type { ICredentialsProps } from 'types/interfaces';

export default class Credentials {
  email?: string;
  username?: string;
  password?: string;
  address?: string;

  constructor({ email, username, password, address} : ICredentialsProps) {
    this.email = email;
    this.username = username;
    this.password = password;
    this.address = address;
  }
}
