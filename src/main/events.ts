import { ipcMain } from 'electron';

ipcMain.on('test', (event, data) => {
  console.log(`(Main) Received: ${data}`);
  event.sender.send("test", "Works");
});
