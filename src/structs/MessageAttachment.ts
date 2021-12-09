export default class MessageAttachment {
  contents: string;
  isBuffer: boolean;

  constructor(contents: string, isBuffer: boolean) {
    this.contents = contents
    this.isBuffer = isBuffer;
  }
}
