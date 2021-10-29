import { createBrowserHistory } from 'history';
import Credentials from 'main/Credentials';
import { UiEvents } from './uiEvents';

export const history = createBrowserHistory();
export const { ipcRenderer } = window.electron;
export const events = new UiEvents();

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
  return await ipcRenderer.invoke('begin_auth', data);
}

export async function Register(data: Credentials) {
  return await ipcRenderer.invoke('register', data);
}

export function setDefaultChannel(channelID: string) {
  localStorage.setItem('lastOpenedChannel', channelID);
}

export function ShowToast() {

}
