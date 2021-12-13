import { createBrowserHistory } from 'history';
import Credentials from 'structs/Credentials';
import { UIEvents } from 'renderer/UIEvents';
import GLOBALS from 'shared/globals';
import UserData from 'structs/UserData';
import type { IElectronRendererWindow } from 'types/interfaces';
import { DebugRendererHandler } from './DebugLogger';

export const history = createBrowserHistory();
export const { ipcRenderer }: IElectronRendererWindow = window.electron;
export const events = new UIEvents();
export const Debug = new DebugRendererHandler(ipcRenderer);

export function Navigate(path: string, data: any)
{
  try {
    history.push(path, data);
  }
  catch (error) {
    console.error(error);
  }
}

export function GetHistoryState()
{
  return history.location.state;
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

let reconnectAttempts = 1;
const timestepStates = [1000, 4000, 8000, 12000]
function HandleWebsocket() {
  const { token, uuid } = GLOBALS.userData;
  const socket = new WebSocket(`wss://api.novastudios.tk/Events/Listen?user_uuid=${uuid}`)
  socket.onmessage = function (message) {
    const event = JSON.parse(message.data);
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
        events.send('receivedChannelDeletedEvent', event.channel);
        break;
      case 5:
        break;
      case 6:
        events.send('receivedAddedToChannelEvent', event.Channel);
        break;
      case 420: // Because why not
        // Trigger fake socket disconnect
        reconnectAttempts = event.Attempts;
        if (socket.onclose != null)
          socket.onclose(new CloseEvent('Force-Close'));
          socket.close();
          break;
      default:
        console.warn(`Unknown event code ${event.EventType}`);
        break;
    }
  };
  socket.onerror = function (error) {
    console.error(`Socket closed unexpectedly.  Attempting reconnect in ${reconnectAttempts}s`);
    if (reconnectAttempts > 4 || GLOBALS.loggedOut) {
      Navigate('/Login', { failed: true });
      return;
    }
    setTimeout(HandleWebsocket, timestepStates[reconnectAttempts - 1]);
    reconnectAttempts++;
  };
  socket.onopen = () => {
    reconnectAttempts = 1;
    socket.send(token);
  };
  socket.onclose = (event) => {
    console.warn(`Socket closed. Attempting reconnect in ${reconnectAttempts}s`);
    if (reconnectAttempts > 4 || GLOBALS.loggedOut) {
      Navigate('/Login', { failed: true });
      return;
    }
    setTimeout(HandleWebsocket, timestepStates[reconnectAttempts - 1]);
    reconnectAttempts++;
  };
}

export function ConductLogin() {
  if (GetHistoryState() != null && GetHistoryState().failed) return;
  if (GLOBALS.userData != null && GLOBALS.userData.uuid.length > 0 && GLOBALS.userData.token.length > 0) {
    Navigate('/chat', null);
    ipcRenderer.send('requestChannels');

    const { uuid } = GLOBALS.userData;

    ipcRenderer.send('requestUserData', uuid);
    GLOBALS.loggedOut = false;
    HandleWebsocket();
  }
  else {
    console.warn('UUID and Token not found, returning to login page.');
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

export async function GetChannelRecipientsFromUUID(uuid: string) {
  return await ipcRenderer.invoke('retrieveChannelName', uuid);
}
