import { ipcRenderer } from './helpers';

ipcRenderer.on('test', () => {
  console.log("Works");
});
