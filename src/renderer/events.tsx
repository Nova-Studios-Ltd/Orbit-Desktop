import { ipcRenderer, Navigate } from './helpers';
import { LoadMessageFeed } from './helpers';

ipcRenderer.on('end_auth', (data: boolean) => {
  if (data) {
    Navigate("/chat");
    ipcRenderer.send('requestChannelData', 'b1642a0175554994b3f593f191c610b5');
  }
});

ipcRenderer.on('receivedChannelData', (data: string) => LoadMessageFeed(data));
