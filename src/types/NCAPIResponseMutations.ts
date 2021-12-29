import { NCAPIResponse } from "main/NCAPI";

export interface FileUploadResponse extends NCAPIResponse {
  payload: string
}
