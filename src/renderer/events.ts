import UserData from 'structs/UserData';
import GLOBALS from 'shared/globals';
import { ConductLogin, getCookie, ipcRenderer, SetAuth } from 'shared/helpers';
import AppNotification from 'renderer/components/Notification/Notification';
import { NotificationStruct } from 'structs/NotificationProps';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';

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

ipcRenderer.on('channelCreationSucceded', (data: boolean) => {
  if (data)
    new AppNotification(new NotificationStruct("Channel Created", "Channel has been created succesfully", false, NotificationStatusType.success, NotificationAudienceType.app)).show();
  else
    new AppNotification(new NotificationStruct("Channel Not Create", "Failed to create channel", false, NotificationStatusType.success, NotificationAudienceType.app)).show();
});
