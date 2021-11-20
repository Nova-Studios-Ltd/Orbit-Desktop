import { net, session } from 'electron';
import { ContentType, WebSocketMethod } from '../types/enums';

const { request } = net;

export function QueryWithAuthentication(endpoint: string, success: ((response: Electron.IncomingMessage, json: Buffer) => void), fail: ((error: Error) => void)=(e)=>{}) {
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

export function PostWithAuthentication(endpoint: string, content_type: ContentType, payload: any, success: ((response: Electron.IncomingMessage, json: Buffer) => void)=(d, e)=>{}, fail: ((error: Error) => void)=(e)=>{}) {
  const re = request({
    method: WebSocketMethod.POST,
    url: `https://api.novastudios.tk/${endpoint}`
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.setHeader('Content-Type', content_type);
    re.on('error', (error) => {
      fail(error);
    });
    re.on('response', (response) => {
      response.on('data', (json) => {
        success(response, json);
      });
    });
    re.write(payload);
    re.end();
    return true;
  }).catch(fail);
}

export function PostWithoutAuthentication(endpoint: string, content_type: ContentType, payload: any, success: ((response: Electron.IncomingMessage, json: Buffer) => void)=(d, e)=>{}, fail: ((error: Error) => void)=(e)=>{}) {
  const re = request({
    method: WebSocketMethod.POST,
    url: `https://api.novastudios.tk/${endpoint}`
  });

  re.setHeader('Content-Type', content_type);
  re.on('error', (error) => {
    fail(error);
  });
  re.on('response', (response) => {
    response.on('data', (json) => {
      success(response, json);
    });
  });
  re.write(payload);
  re.end();
}

export function DeleteWithAuthentication(endpoint: string, success: (() => void)=()=>{}, fail: ((error: Error) => void)=(e)=>{}) {
  const re = request({
    method: 'DELETE',
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
  }).catch(fail);
}
