import { ipcMain, BrowserWindow } from 'electron';

const window = BrowserWindow.getFocusedWindow();

export function SendIPCMessageToRenderer(channel: string, data: any) {
  try {
    const json_data = JSON.stringify(data);
    window.webContents.send(channel, json_data);
  }
  catch (ex) {
    console.error(ex);
  }
}

ipcMain.on('test', (data) => {
  console.log(`Received: ${data}`);
  SendIPCMessageToRenderer("test", "Works");
});
