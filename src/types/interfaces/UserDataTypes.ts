import type { IAESMemoryEncryptData } from "shared/encryptionClasses";

export interface IUserData {
  username: string,
  uuid: string,
  token: string,
  discriminator: string,
  avatarSrc: string
}

export interface IUserLoginData {
  uuid: string,
  token: string,
  publicKey: string,
  key: IAESMemoryEncryptData
}

export interface IUser {
  uuid: string;
  username: string;
  discriminator: string;
  email: string;
  creationData: string;
  avatar: string;
}

export interface UserIDNameTuple {
  userID: string,
  username: string,
  avatar: string
}
