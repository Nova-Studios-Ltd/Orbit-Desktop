import { IUserData } from 'dataTypes/interfaces';

export default class UserData {
  username: string;
  uuid: string;
  token: string;
  discriminator: string;
  avatarSrc: string;

  constructor(props?: IUserData) {
    if (props != null) {
      this.username = props.username || '';
      this.uuid = props.uuid || '';
      this.token = props.token || '';
      this.discriminator = props.discriminator || '';
      this.avatarSrc = props.avatarSrc || '';
    }
    else {
      this.username = '';
      this.uuid = '';
      this.token = '';
      this.discriminator = '';
      this.avatarSrc = '';
    }
  }
}
