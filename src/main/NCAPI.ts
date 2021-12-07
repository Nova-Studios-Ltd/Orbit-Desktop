import { session } from 'electron';
import { createReadStream } from 'fs';
import Axios from 'axios';
import FormData from 'form-data';
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
  /*const re = request({
    method: WebSocketMethod.GET,
    url: `https://api.novastudios.tk/${endpoint}`
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.on('response', (response) => {
      response.on('data', (json) => {
        success(response, json);
      });
    });
    re.on('error', (error) => {
      fail(error);
    });
    re.end();
    return true;
  }).catch(fail);*/

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
  /*const re = request({
    method: WebSocketMethod.POST,
    url: `https://api.novastudios.tk/${endpoint}`
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    if (content_type != ContentType.EMPTY)
      re.setHeader('Content-Type', content_type);
    re.on('error', (error) => {
      fail(error);
    });
    re.on('response', (response) => {
      response.on('data', (json) => {
        success(response, json);
      });
    });
    if (payload != '')
      re.write(payload);
    re.end();
    return true;
  }).catch(fail);*/

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
  /*const re = request({
    method: WebSocketMethod.POST,
    url: `https://api.novastudios.tk/${endpoint}`
  });
  if (content_type != ContentType.EMPTY)
    re.setHeader('Content-Type', content_type);
  re.on('error', (error) => {
    fail(error);
  });
  re.on('response', (response) => {
    response.on('data', (json) => {
      success(response, json);
    });
  });
  if (payload != '')
    re.write(payload);
  re.end();*/
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
  /*const re = request({
    method: WebSocketMethod.DELETE,
    url: `https://api.novastudios.tk/${endpoint}`,
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.on('response', (res) => {
      res.on('data', (json) => {
        DebugMain.Log(json.toString(), LogContext.Main);
      });
      if (res.statusCode == 200) success();
    })
    re.on('error', (error) => {
      fail(error);
    });
    re.end();
    return true;
  }).catch(fail);*/
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
  /*const re = request({
    method: WebSocketMethod.PUT,
    url: `https://api.novastudios.tk/${endpoint}`,
  });

  if (content_type != ContentType.EMPTY)
    re.setHeader('Content-Type', content_type);
  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.on('response', (res) => {
      if (res.statusCode == 200) success();
    })
    re.on('error', (error) => {
      fail(error);
    });
    if (payload != '')
      re.write(payload);
    re.end();
    return true;
  }).catch(fail);*/


  try {
    const token = await RetreiveToken();
    const resp = await Axios.put(`https://api.novastudios.tk/${endpoint}`, payload, {
      headers: {
        'Authorization': token,
        'Content-Type': content_type
      }
    });
    if (resp.status == 200) return resp.data;
    return resp.statusText;
  }
  catch (e) {
    return e;
  }
}

export async function PostFileWithAuthentication(endpoint: string, file: string) {
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
    if (resp.status == 200) return resp.data;
    return resp.statusText;
  }
  catch (e) {
    return e;
  }
}
