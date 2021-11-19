import { net, session } from 'electron';
import { WebSocketMethod } from '../types/enums';

const { request } = net;

export function QueryWithAuthentication(endpoint: string, success: Function) {
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
      console.error(error);
    });
    re.end();
    return true;
  }).catch((error) => {console.error(error)});
}

export function PostWithAuthentication(endpoint: string, content_type: string, payload: any, success: Function) {
  const re = request({
    method: 'POST',
    url: `https://api.novastudios.tk/${endpoint}`
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.setHeader('Content-Type', content_type);
    re.on('error', (error) => {
      console.error(error);
    });
    re.on('response', (response) => {
      response.on('data', (json) => {
        success(response, json);
      })
    })
    re.write(payload);
    re.end();
    return true;
  }).catch((error) => {console.error(error)});
}

export function PostWithoutAuthentication(endpoint: string, content_type: string, payload: any, success: Function) {
  const re = request({
    method: 'POST',
    url: `https://api.novastudios.tk/${endpoint}`
  });

  re.setHeader('Content-Type', content_type);
  re.on('error', (error) => {
    console.error(error);
  });
  re.on('response', (response) => {
    response.on('data', (json) => {
      success(response, json);
    })
  })
  re.write(payload);
  re.end();
}
