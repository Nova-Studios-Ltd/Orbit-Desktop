import { NCAPIResponse } from "main/NCAPI";

export interface FileUploadResponse extends NCAPIResponse {
  payload: string
}

export interface UserQueryResponse extends NCAPIResponse {
  payload: {
    uuid: string,
    username: string,
    discriminator: string,
    email: string,
    creationDate: string,
    avatar: string
  }
}

export interface AuthResponse extends NCAPIResponse {
  payload: {
    uuid: string,
    token: string,
    publicKey: string,
    key: {
      content: string,
      iv: string
    }
  }
}
