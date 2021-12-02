import UserData from 'structs/UserData';
import GLOBALS from 'shared/globals';
import { ConductLogin, getCookie, ipcRenderer, Navigate, SetAuth, RemoveCachedCredentials } from 'shared/helpers';
import AppNotification from 'renderer/components/Notification/Notification';
import { NotificationStruct } from 'structs/NotificationProps';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';

ipcRenderer.on('endAuth', (data: boolean) => {
  if (data) {
    SetAuth();
    ConductLogin();
  }
});

ipcRenderer.on('receivedUserData', (data: string) => {
  if (data != null) {
    const userData = JSON.parse(data) as UserData;
    GLOBALS.userData.username = userData.username;
    GLOBALS.userData.discriminator = userData.discriminator;
  }
});

ipcRenderer.on('channelCreationSucceded', (data: boolean) => {
  if (data)
    new AppNotification(new NotificationStruct('Channel Created', 'Channel has been created succesfully', false, NotificationStatusType.success, NotificationAudienceType.app)).show();
  else
    new AppNotification(new NotificationStruct('Channel Not Create', 'Failed to create channel', false, NotificationStatusType.success, NotificationAudienceType.app)).show();
});

ipcRenderer.on('clientFocused', (data: boolean) => {
  GLOBALS.isFocused = true;
});

ipcRenderer.on('clientUnfocused', (data: boolean) => {
  GLOBALS.isFocused = false;
});

ipcRenderer.on('userAccountDeleted', (success: boolean) => {
  if (success) {
    new AppNotification(new NotificationStruct('Account Management', 'Successfully deleted your account.', false, NotificationStatusType.success, NotificationAudienceType.app)).show();
    RemoveCachedCredentials();
    Navigate('/login', null);
  }
  else {
    new AppNotification(new NotificationStruct('Account Management', 'Failed to delete your user account.', false, NotificationStatusType.error, NotificationAudienceType.app)).show();
  }
})
