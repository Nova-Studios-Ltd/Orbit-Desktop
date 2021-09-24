import { createBrowserHistory } from 'history';
import Credentials from './Credentials';

export const history = createBrowserHistory();
export const { ipcRenderer } = window.electron;

export function SendIPCMessage(channel: string, data: any) {
  try {
    const json_data = JSON.stringify(data);
    window.Electron.ipcRenderer.send(channel, json_data)
  }
  catch (ex) {
    console.error(ex);
  }
}

export function Navigate(path: string)
{
  try {
    history.push(path);
    console.log(`Current URL: ${window.location.href}`)
  }
  catch (error) {
    console.error(error);
  }
}

export function Authenticate(data: Credentials) {
  console.log(`Username: ${data.username}, Password: ${data.password}, Address: ${data.address}`);
  // TODO: Implement code for establishing connection to server
  Navigate("/chat");
}
