import { publicEncrypt, privateDecrypt, generateKeyPairSync, createCipheriv, randomBytes, createDecipheriv, createHash } from 'crypto';
import { Debug } from './debug';
import { AESMemoryEncryptData, RSAMemoryKeyPair } from './encryptionClasses';

export function GenerateRSAKeyPair(): RSAMemoryKeyPair {
  const keypair = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
      },
      privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
      }
  });
  return new RSAMemoryKeyPair(keypair.privateKey, keypair.publicKey);
}

export async function GenerateRSAKeyPairAsync() : Promise<RSAMemoryKeyPair> {
  const keypair = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
      },
      privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
      }
  });
  return new RSAMemoryKeyPair(keypair.privateKey, keypair.publicKey);
}

export function EncryptUsingPubKey(pub: string, data: string) : string {
  const dataBuffer = Buffer.from(data);
  return publicEncrypt(pub, dataBuffer).toString('base64');
}

export async function EncryptUsingPubKeyAsync(pub: string, data: string) : Promise<string> {
  const dataBuffer = Buffer.from(data);
  return publicEncrypt(pub, dataBuffer).toString('base64');
}

export function DecryptUsingPrivKey(priv: string, data: string) : string {
  if (data != null) {
    const dataBuffer = Buffer.from(data, 'base64');
    return privateDecrypt(priv, dataBuffer).toString('utf-8');
  }
  Debug.Error('Failed to decrypt message: buffer was empty');
  return '';
}

export async function DecryptUsingPrivKeyAsync(priv: string, data: string) : Promise<string> {
  if (data != null) {
    const dataBuffer = Buffer.from(data, 'base64');
    return privateDecrypt(priv, dataBuffer).toString('utf-8');
  }
  Debug.Error('Failed to decrypt message: buffer was empty', 'async');
  return '';
}

export function EncryptUsingAES(key: string, data: string, init_iv?: string) : AESMemoryEncryptData {
  const iv = (init_iv == undefined)? randomBytes(16) : Buffer.from(init_iv, 'base64');
  const cipher = createCipheriv('aes-256-ctr', Buffer.from(key, 'base64'), iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return new AESMemoryEncryptData(iv.toString('base64'), encrypted.toString('base64'));
}

export async function EncryptUsingAESAsync(key: string, data: string, init_iv?: string) : Promise<AESMemoryEncryptData> {
  const iv = (init_iv == undefined)? randomBytes(16) : Buffer.from(init_iv, 'base64');
  const cipher = createCipheriv('aes-256-ctr', Buffer.from(key, 'base64'), iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return new AESMemoryEncryptData(iv.toString('base64'), encrypted.toString('base64'));
}

export function DecryptUsingAES(key: string, data: AESMemoryEncryptData) : string {
  const decipher = createDecipheriv('aes-256-ctr', Buffer.from(key, 'base64'), Buffer.from(data.iv, 'base64'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(data.content, 'base64')), decipher.final()])
  return decrypted.toString();
}

export async function DecryptUsingAESAsync(key: string, data: AESMemoryEncryptData) : Promise<string> {
  const decipher = createDecipheriv('aes-256-ctr', Buffer.from(key, 'base64'), Buffer.from(data.iv, 'base64'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(data.content, 'base64')), decipher.final()])
  return decrypted.toString();
}

export function GenerateSHA256Hash(data: string) : string {
  const sha512 = createHash('sha256');
  const hash = sha512.update(data, 'utf-8');
  return hash.digest('base64');
}

export async function GenerateSHA256HashAsync(data: string) : Promise<string> {
  const sha512 = createHash('sha256');
  const hash = sha512.update(data, 'utf-8');
  return hash.digest('base64');
}

export function GenerateKey(length: number) : string {
  return randomBytes(length).toString('base64');
}

export async function GenerateKeyAsync(length: number) : Promise<string> {
  return randomBytes(length).toString('base64');
}
