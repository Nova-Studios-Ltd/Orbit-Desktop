import { createBrowserHistory } from 'history';
import Credentials from 'dataTypes/Credentials';
import { UIEvents } from 'renderer/UIEvents';

export const history = createBrowserHistory();
export const { ipcRenderer } = window.electron;
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

export function LoadMessageFeed(channelData: string) {
  const messages = JSON.parse(channelData);
  return messages;
}

export async function Authenticate(data: Credentials) {
  return await ipcRenderer.invoke('beginAuth', data, window.location.origin);
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
