import { createBrowserHistory } from 'history';
import Credentials from 'structs/Credentials';
import { UIEvents } from 'renderer/UIEvents';
import GLOBALS from 'shared/globals';
import UserData from 'structs/UserData';
import { IElectronRendererWindow } from 'types/interfaces';

export const history = createBrowserHistory();
export const { ipcRenderer }: IElectronRendererWindow = window.electron;
export const events = new UIEvents();

export function Navigate(path: string, data: any)
{
  try {
    history.push(path, data);
  }
  catch (error) {
    console.error(error);
  }
}

export function getCookie(cname: string) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

export function ConductLogin() {
  if (GLOBALS.userData != null && GLOBALS.userData.uuid.length > 0 && GLOBALS.userData.token.length > 0) {
    let socket : WebSocket;

    Navigate('/chat', null);
    ipcRenderer.send('requestChannels');
    console.log("Sent requestChannels event, getting token and uuid next...")
    console.log(getCookie('userData'));
    const { token, uuid } = GLOBALS.userData;
    ipcRenderer.send('requestUserData', uuid);
    socket = new WebSocket(`wss://api.novastudios.tk/Events/Listen?user_uuid=${uuid}`)
    socket.onmessage = function (message) {
      var event = JSON.parse(message.data);
      switch (event.EventType) {
        case -1:
          console.log('<Beat>');
          break;
        case 0:
          ipcRenderer.send('requestChannelUpdate', event.Channel, event.Message);
          break;
        case 1:
          events.send('receivedMessageDeleteEvent', event.Channel, event.Message);
          break;
        case 2:
          ipcRenderer.send('requestMessage', event.Channel, event.Message);
          break;
        case 3:
          events.send('receivedChannelCreatedEvent', event.Channel);
          break;
        case 4:
          break;
        case 5:
          events.send('receivedAddedToChannelEvent', event.Channel);
          break;
        default:
          break;
      }
    };
    socket.onerror = function (error) {
      console.error("Socket closed unexpectedly");
    };
    socket.onopen = function () {
      socket.send(token);
      console.warn("Socket opened")
    };
    socket.onclose = function (event) {
      console.warn(event);
    }
  }
  else {
    console.error('UUID and Token do not exist. Cannot conduct login.');
  }
}

export function LoadMessageFeed(channelData: string) {
  const messages = JSON.parse(channelData);
  return messages;
}

export async function Authenticate(data: Credentials) {
  return await ipcRenderer.invoke('beginAuth', data, window.location.origin);
}

export function SetAuth() {
  const cookie = getCookie('userData');
  if (cookie.length > 0) {
    const cookie_data = JSON.parse(getCookie('userData'));
    if (cookie_data != null) {
      const { token, uuid } = cookie_data;
      if (token != null && uuid != null) {
        GLOBALS.userData.token = token;
        GLOBALS.userData.uuid = uuid;
      }
    }
  }
}

export function RemoveCachedCredentials() {
  ipcRenderer.send('logout');
  GLOBALS.userData = new UserData(null);
}

export async function Register(data: Credentials) {
  return await ipcRenderer.invoke('register', data);
}

export function setDefaultChannel(channelID: string) {
  localStorage.setItem('lastOpenedChannel', channelID);
}

export async function copyToClipboard(text: string) {
  return await ipcRenderer.invoke('copyToClipboard', text);
}
