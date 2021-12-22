import GLOBALS from 'shared/globals';
import { ConductLogin, ipcRenderer, Navigate, SetAuth, RemoveCachedCredentials } from 'shared/helpers';
import AppNotification from 'renderer/components/Notification/Notification';
import { NotificationStruct } from 'structs/NotificationProps';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';

ipcRenderer.on('endAuth', (data: boolean) => {
  if (data) {
    SetAuth();
    ConductLogin();
  }
});

ipcRenderer.on('ChannelCreated', (data: boolean) => {
  if (data)
    new AppNotification(new NotificationStruct('Channel Created', 'Channel has been created succesfully', false, NotificationStatusType.success, NotificationAudienceType.app)).show();
  else
    new AppNotification(new NotificationStruct('Channel Not Create', 'Failed to create channel', false, NotificationStatusType.success, NotificationAudienceType.app)).show();
});

ipcRenderer.on('CREATEGroupChannel', (data: boolean) => {
  if (data)
    new AppNotification(new NotificationStruct('Group Channel Created', 'Channel has been created succesfully', false, NotificationStatusType.success, NotificationAudienceType.app)).show();
  else
    new AppNotification(new NotificationStruct('Group Channel Not Create', 'Failed to create channel', false, NotificationStatusType.success, NotificationAudienceType.app)).show();
});

ipcRenderer.on('clientFocused', (data: boolean) => {
  GLOBALS.isFocused = true;
});

ipcRenderer.on('clientUnfocused', (data: boolean) => {
  GLOBALS.isFocused = false;
});

ipcRenderer.on('UserDeleted', (success: boolean) => {
  if (success) {
    new AppNotification(new NotificationStruct('Account Management', 'Successfully deleted your account.', false, NotificationStatusType.success, NotificationAudienceType.app)).show();
    RemoveCachedCredentials();
    Navigate('/login', null);
  }
  else {
    new AppNotification(new NotificationStruct('Account Management', 'Failed to delete your user account.', false, NotificationStatusType.error, NotificationAudienceType.app)).show();
  }
})
