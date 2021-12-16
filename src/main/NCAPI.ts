import { session } from 'electron';
import { createReadStream } from 'fs';
import Axios from 'axios';
import FormData from 'form-data';
import { FormData as FormDataNode } from 'formdata-node'
import {FormDataEncoder} from "form-data-encoder"
import { Readable } from 'stream';
import https from 'https';
import { ContentType } from '../types/enums';

export class NCAPIResponse {
  status: number | undefined;
  statusText: string | undefined;
  error: unknown | undefined;
  payload: unknown | undefined;

  constructor(status?: number | undefined, statusText?: string | undefined, payload?: unknown | undefined, error?: unknown | undefined) {
    this.status = status || -1;
    this.statusText = statusText || '';
    this.error = error;
    this.payload = payload;
  }
}

async function RetreiveToken() : Promise<string> {
  const cookie = (await session.defaultSession.cookies.get({name: 'userData'}))[0].value;
  const { token } = JSON.parse(cookie);
  return token;
}

export async function SetCookie(cookieName: string, cookieData: string) : Promise<boolean> {
  return new Promise((resolve) => {
    session.defaultSession.cookies.set({url: 'http://localhost', name: cookieName, value: cookieData, expirationDate: new Date().getTime() + 30*24*60*60*1000 }).then(() => resolve(true)).catch(() => resolve(false))
  });
}

export async function QueryWithAuthentication(endpoint: string) : Promise<NCAPIResponse> {
  try {
    const token = await RetreiveToken();
    const resp = await Axios.get(`https://api.novastudios.tk/${endpoint}`, {
      headers: {
        'Authorization': token
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
        'Authorization': token,
        'Content-Type': content_type
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
        'Content-Type': content_type
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
        'Authorization': token
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
        'Authorization': token,
        'Content-Type': content_type
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
    if (content_type == ContentType.EMPTY) header = {'Authorization': token};
    else header = { 'Authorization': token, 'Content-Type': content_type };
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
    const payload = new FormData();
    payload.append('file', createReadStream(file));
    const token = await RetreiveToken();
    const resp = await Axios.post(`https://api.novastudios.tk/${endpoint}`, payload, {
      headers: {
        ...payload.getHeaders(),
        'Authorization': token
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


export async function PostBufferWithAuthentication(endpoint: string, buffer: Buffer) : Promise<NCAPIResponse> {
  try {
    const payload = new FormData();



    payload.append('file', buffer, { filename: 'unknown.png'});
    //payload.append('file', stream, { filename: 'unknown.png', contentType: 'image/png', knownLength: buffer.toString().length });
    const token = await RetreiveToken();
    const resp = await Axios.post(`https://api.novastudios.tk/${endpoint}`, payload, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${payload.getBoundary()}`,
        'Authorization': token
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
