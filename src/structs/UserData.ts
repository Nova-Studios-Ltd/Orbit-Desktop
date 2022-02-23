import type { IUserData } from "types/types";
import { Dictionary } from "../shared/dictionary";
import { RSAMemoryKeyPair } from "../shared/encryptionClasses";

export default class UserData {
  username: string;
  uuid: string;
  token: string;
  keyPair: RSAMemoryKeyPair;
  keystore: Dictionary<string>;
  discriminator: string;
  avatarSrc: string;

  constructor(props?: IUserData) {
    if (props != undefined) {
      this.username = props.username || "";
      this.uuid = props.uuid || "";
      this.token = props.token || "";
      this.discriminator = props.discriminator || "";
      this.avatarSrc = props.avatarSrc || "";
    }
    else {
      this.username = "";
      this.uuid = "";
      this.token = "";
      this.discriminator = "";
      this.avatarSrc = "";
    }
    this.keyPair = new RSAMemoryKeyPair("", "");
    this.keystore = new Dictionary<string>();
  }
}
