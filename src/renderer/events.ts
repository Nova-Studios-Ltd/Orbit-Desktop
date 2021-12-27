import GLOBALS from 'shared/globals';
import { ConductLogin, ipcRenderer, Navigate, SetAuth, RemoveCachedCredentials } from 'shared/helpers';
import AppNotification from 'renderer/components/Notification/Notification';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';

ipcRenderer.on('endAuth', (data: boolean) => {
  if (data) {
    SetAuth();
    ConductLogin();
  }
});

ipcRenderer.on('ChannelCreated', (data: boolean) => {
  if (data)
    new AppNotification({ title: 'Channel Created', body: 'Channel has been created succesfully', playSound: false, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
  else
    new AppNotification({ title: 'Channel Not Create', body: 'Failed to create channel', playSound: false, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
});

ipcRenderer.on('CREATEGroupChannel', (data: boolean) => {
  if (data)
    new AppNotification({ title: 'Group Channel Created', body: 'Channel has been created succesfully', playSound: false, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
  else
    new AppNotification({ title: 'Group Channel Not Create', body: 'Failed to create channel', playSound: false, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
});

ipcRenderer.on('clientFocused', (data: boolean) => {
  GLOBALS.isFocused = true;
});

ipcRenderer.on('clientUnfocused', (data: boolean) => {
  GLOBALS.isFocused = false;
});

ipcRenderer.on('UserDeleted', (success: boolean) => {
  if (success) {
    new AppNotification({ title: 'Account Management', body: 'Successfully deleted your account.', playSound: false, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
    RemoveCachedCredentials();
    Navigate('/login', null);
  }
  else {
    new AppNotification({ title: 'Account Management', body: 'Failed to delete your user account.', playSound: false, notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
  }
})
