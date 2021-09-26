import { ipcRenderer } from './helpers';

ipcRenderer.on('test', (event: any, data: any) => {
  console.log(`(Renderer) Received: ${data}`);
});
