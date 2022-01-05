import type { IUserData } from 'types/types';
import { RSAMemoryKeyPair } from '../main/encryptionClasses';

export default class UserData {
  username: string;
  uuid: string;
  token: string;
  keyPair: RSAMemoryKeyPair;
  keystore: { [key: string] : string; };
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
    this.keyPair = new RSAMemoryKeyPair('', '');
    this.keystore = {}
  }
}
