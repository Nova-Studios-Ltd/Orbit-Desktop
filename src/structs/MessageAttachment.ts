import { MD5 } from "crypto-js";

export default class MessageAttachment {
  id: string;
  contents: string;
  isBuffer: boolean;

  constructor(contents: string, isBuffer: boolean) {
    this.contents = contents;
    this.isBuffer = isBuffer;

    if (!isBuffer) {
      this.id = MD5(`${contents}_${Date.now}`).toString();
    }
    else {
      this.id = MD5(Date.now.toString()).toString();
    }
  }
}
