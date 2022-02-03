import { createReadStream } from "fs";
import Axios from "axios";
import FormData from "form-data";
import { basename } from "path";
import { createCipheriv } from "crypto";
import { PassThrough } from "stream";
import { ContentType } from "../types/enums";
import { Manager } from "./settingsManager";

export class NCAPIResponse {
  status: number | undefined;
  statusText: string | undefined;
  error: unknown | undefined;
  payload: any | undefined;

  constructor(status?: number | undefined, statusText?: string | undefined, payload?: unknown, error?: unknown | undefined) {
    this.status = status || -1;
    this.statusText = statusText || "";
    this.error = error;
    this.payload = payload;
  }
}

async function RetreiveToken() : Promise<string> {
  if (Manager != null) {
    return Manager._UserData.token;
  }
  return Promise.reject(new Error("Settings nanager was null"));
}

export async function QueryWithAuthentication(endpoint: string) : Promise<NCAPIResponse> {
  try {
    const token = await RetreiveToken();
    const resp = await Axios.get(`https://api.novastudios.tk/${endpoint}`, {
      headers: {
        "Authorization": token
      }
    });
    return new NCAPIResponse(resp.status, resp.statusText, resp.data);
  }
  catch (e) {
    return new NCAPIResponse(undefined, undefined, undefined, e);
  }
}

export async function GETWithAuthentication(url: string) : Promise<NCAPIResponse> {
  try {
    const token = await RetreiveToken();
    const resp = await Axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "Authorization": token
      }
    });
    return new NCAPIResponse(resp.status, resp.statusText, resp.data);
  }
  catch (e) {
    return new NCAPIResponse(undefined, undefined, undefined, e);
  }
}

export async function PostWithAuthentication(endpoint: string, content_type: ContentType, payload: string) : Promise<NCAPIResponse> {
  try {
    const token = await RetreiveToken();
    const resp = await Axios.post(`https://api.novastudios.tk/${endpoint}`, payload, {
      headers: {
        "Authorization": token,
        "Content-Type": content_type
      }
    });
    return new NCAPIResponse(resp.status, resp.statusText, resp.data);
  }
  catch (e) {
    return new NCAPIResponse(undefined, undefined, undefined, e);
  }
}

export async function PostWithoutAuthentication(endpoint: string, content_type: ContentType, payload: string) : Promise<NCAPIResponse> {
  try {
    const resp = await Axios.post(`https://api.novastudios.tk/${endpoint}`, payload, {
      headers: {
        "Content-Type": content_type
      }
    });
    return new NCAPIResponse(resp.status, resp.statusText, resp.data);
  }
  catch (e) {
    return new NCAPIResponse(undefined, undefined, undefined, e);
  }
}

export async function DeleteWithAuthentication(endpoint: string) : Promise<NCAPIResponse> {
  try {
    const token = await RetreiveToken();
    const resp = await Axios.delete(`https://api.novastudios.tk/${endpoint}`, {
      headers: {
        "Authorization": token
      }
    });
    return new NCAPIResponse(resp.status, resp.statusText, resp.data);
  }
  catch (e) {
    return new NCAPIResponse(undefined, undefined, undefined, e);
  }
}

export async function PutWithAuthentication(endpoint: string, content_type: ContentType, payload: string) : Promise<NCAPIResponse> {
  try {
    const token = await RetreiveToken();
    const resp = await Axios.put(`https://api.novastudios.tk/${endpoint}`, payload, {
      headers: {
        "Authorization": token,
        "Content-Type": content_type
      }
    });
    return new NCAPIResponse(resp.status, resp.statusText, resp.data);
  }
  catch (e) {
    return new NCAPIResponse(undefined, undefined, undefined, e);
  }
}

export async function PatchWithAuthentication(endpoint: string, content_type: ContentType, payload: string) : Promise<NCAPIResponse> {
  try {
    let header = {};
    const token = await RetreiveToken();
    if (content_type == ContentType.EMPTY) header = {"Authorization": token};
    else header = { "Authorization": token, "Content-Type": content_type };
    const resp = await Axios.patch(`https://api.novastudios.tk/${endpoint}`, payload, {
      headers: header
    });
    return new NCAPIResponse(resp.status, resp.statusText, resp.data);
  }
  catch (e) {
    return new NCAPIResponse(undefined, undefined, undefined, e);
  }
}

export async function PostFileWithAuthentication(endpoint: string, file: string) : Promise<NCAPIResponse> {
  try {
    const read = createReadStream(file);

    const payload = new FormData();
    payload.append("file", read, {filename: basename(file) });
    const token = await RetreiveToken();
    const resp = await Axios.post(`https://api.novastudios.tk/${endpoint}`, payload, {
      headers: {
        ...payload.getHeaders(),
        "Authorization": token
      },
      maxBodyLength: 20971520,
      maxContentLength: 20971520
    });
    return new NCAPIResponse(resp.status, resp.statusText, resp.data);
  }
  catch (e) {
    return new NCAPIResponse(undefined, undefined, undefined, e);
  }
}


export async function PostFileWithAuthenticationAndEncryption(endpoint: string, file: string, key: string, iv: string) : Promise<NCAPIResponse> {
  try {
    const cipher = createCipheriv("aes-256-ctr", Buffer.from(key, "base64"), Buffer.from(iv, "base64"));
    const read = createReadStream(file);
    const d = new PassThrough();
    read.pipe(cipher).pipe(d);

    const payload = new FormData();
    payload.append("file", d, {filename: basename(file) });
    const token = await RetreiveToken();
    const resp = await Axios.post(`https://api.novastudios.tk/${endpoint}`, payload, {
      headers: {
        ...payload.getHeaders(),
        "Authorization": token
      },
      maxBodyLength: 20971520,
      maxContentLength: 20971520
    });
    return new NCAPIResponse(resp.status, resp.statusText, resp.data);
  }
  catch (e) {
    return new NCAPIResponse(undefined, undefined, undefined, e);
  }
}


export async function PostBufferWithAuthenticationAndEncryption(endpoint: string, buffer: Buffer, key: string, iv: string) : Promise<NCAPIResponse> {
  try {
    const payload = new FormData();

    const cipher = createCipheriv("aes-256-ctr", Buffer.from(key, "base64"), Buffer.from(iv, "base64"));
    const d = new PassThrough();
    const out = new PassThrough();
    d.end(buffer);
    d.pipe(cipher).pipe(out);

    payload.append("file", out, { filename: "unknown.png"});
    const token = await RetreiveToken();
    const resp = await Axios.post(`https://api.novastudios.tk/${endpoint}`, payload, {
      headers: {
        ...payload.getHeaders(),
        "Authorization": token
      },
      maxBodyLength: 20971520,
      maxContentLength: 20971520
    });
    console.log(resp.status);
    return new NCAPIResponse(resp.status, resp.statusText, resp.data);
  }
  catch (e) {
    console.log(e);
    return new NCAPIResponse(undefined, undefined, undefined, e);
  }
}
