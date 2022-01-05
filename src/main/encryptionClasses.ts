export class RSAMemoryKeyPair {
  PrivateKey: string;
  PublicKey: string;

  constructor(priv: string, pub: string) {
      this.PrivateKey = priv;
      this.PublicKey = pub;
  }
}

export interface IAESMemoryEncryptData {
  iv: string,
  content: string
}

export class AESMemoryEncryptData implements IAESMemoryEncryptData {
  iv: string;
  content: string;

  constructor(iv: string, content: string) {
      this.iv = iv;
      this.content = content;
  }
}
