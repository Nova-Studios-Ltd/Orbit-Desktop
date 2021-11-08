import UserData from 'dataTypes/UserData';
import GLOBALS from 'shared/globals';
import { ConductLogin, getCookie, ipcRenderer, SetAuth } from 'shared/helpers';

ipcRenderer.on('endAuth', (data: boolean) => {
  console.log(data);
  if (data) {
    SetAuth();
    ConductLogin();
  }
});

ipcRenderer.on('receivedUserData', (data: string) => {
  console.warn(data);
  if (data != null) {
    const userData = JSON.parse(data) as UserData;
    GLOBALS.userData.username = userData.username;
    GLOBALS.userData.discriminator = userData.discriminator;
  }
});

//ipcRenderer.on('receivedChannelData', (data: string) => LoadMessageFeed(data));
