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
    console.log(`Current URL: ${window.location.href}`)
  }
  catch (error) {
    console.error(error);
  }
}

export function Logout() {
  Navigate("/login");
}

export function LoadMessageFeed(channelData: string) {
  const messages = JSON.parse(channelData);
  console.log(messages);
  return messages;
}

export function Authenticate(data: Credentials, callback: Function) {
  ipcRenderer.send("begin_auth", data, callback);
}
