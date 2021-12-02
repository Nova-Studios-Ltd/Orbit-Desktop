import { net, session } from 'electron';

import { createReadStream } from 'fs';
import Axios from 'axios';
import FormData from 'form-data';
import https from 'https';


import { ContentType, WebSocketMethod } from '../types/enums';

const { request } = net;

export function QueryWithAuthentication(endpoint: string, success: ((response: Electron.IncomingMessage, json: Buffer) => void), fail: ((error: Error) => void)=()=>{}) {
  const re = request({
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
  }).catch(fail);
}

export function PostWithAuthentication(endpoint: string, content_type: ContentType, payload: string, success: ((response: Electron.IncomingMessage, json: Buffer) => void)=()=>{}, fail: ((error: Error) => void)=()=>{}) {
  const re = request({
    method: WebSocketMethod.POST,
    url: `https://api.novastudios.tk/${endpoint}`
    //url: `https://localhost:5555/${endpoint}`
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
  }).catch(fail);
}

export function PostWithoutAuthentication(endpoint: string, content_type: ContentType, payload: string, success: ((response: Electron.IncomingMessage, json: Buffer) => void)=()=>{}, fail: ((error: Error) => void)=()=>{}) {
  const re = request({
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
  re.end();
}

export function DeleteWithAuthentication(endpoint: string, success: (() => void)=()=>{}, fail: ((error: Error) => void)=()=>{}) {
  const re = request({
    method: WebSocketMethod.DELETE,
    url: `https://api.novastudios.tk/${endpoint}`,
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.on('response', (res) => {
      if (res.statusCode == 200) success();
    })
    re.on('error', (error) => {
      fail(error);
    });
    re.end();
    return true;
  }).catch(fail);
}

export function PutWithAuthentication(endpoint: string, content_type: ContentType, payload: string, success: (() => void)=()=>{}, fail: ((error: Error) => void)=()=>{}) {
  const re = request({
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
      re.write(payload)
    re.end();
    return true;
  }).catch(fail);
}

export function PostFileWithAuthentication(endpoint: string, file: string, success: ((response: string) => void)=()=>{}, fail: ((reason: any)=>void)=()=>{}) {
  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    const formData = new FormData();
      formData.append('file', createReadStream(file))
      Axios.post(`https://api.novastudios.tk/${endpoint}`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': token
        }
      }).then((resp) => {
        success(resp.data);
      }).catch((reas) => {
        fail(reas);
      });
  });
}
