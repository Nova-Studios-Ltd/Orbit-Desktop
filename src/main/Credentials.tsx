export default class Credentials {
  username: string;
  password: string;
  address: string;

  constructor(username, password, address) {
    this.username = username;
    this.password = password;
    this.address = address;
  }
}
