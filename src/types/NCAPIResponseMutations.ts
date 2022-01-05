import { NCAPIResponse } from "main/NCAPI";

export interface FileUploadResponse extends NCAPIResponse {
  payload: string
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
