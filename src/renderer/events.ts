import { ConductLogin, ipcRenderer, Navigate, SetAuth, RemoveCachedCredentials, SetCookie, Debug, Manager } from 'shared/helpers';
import AppNotification from 'renderer/components/Notification/Notification';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';

ipcRenderer.on('endAuth', async (privKey: string, pubKey: string, uuid: string, token: string) => {
  SetCookie('userData', JSON.stringify({uuid, token}), 60);

  // Store Pub/Priv key
  ipcRenderer.invoke('SetPubkey', pubKey).then((result: boolean) => {
    if (result) {
      Debug.Success('Public key stored successfully');
      SetAuth().then(() => ConductLogin());
    }
    else {
      Debug.Error('Unable to store public key. Aborting login...', 'when writing public key to file');
    }
  })
});

ipcRenderer.on('UsernameUpdated', (result: boolean) => {
  if (result) {
    new AppNotification({ title: 'Username Updated', playSound: false, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
  }
  else {
    new AppNotification({ title: 'Unable to Change Username', playSound: false, notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
  }
});

ipcRenderer.on('ChannelCreated', (data: boolean) => {
  if (data)
    new AppNotification({ title: 'Channel Created', body: 'Channel has been created succesfully', playSound: false, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
  else
    new AppNotification({ title: 'Channel Not Create', body: 'Task failed successfullyl', playSound: false, notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
});

ipcRenderer.on('CREATEGroupChannel', (data: boolean) => {
  if (data)
    new AppNotification({ title: 'Group Channel Created', playSound: false, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
  else
    new AppNotification({ title: 'Unable to Create Group Channel', playSound: false, notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
});

ipcRenderer.on('ChannelNameUpdated', (channelID: string) => {
  if (channelID != null) {
    new AppNotification({ title: 'Channel Name Updated', playSound: false, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
  }
  else {
    new AppNotification({ title: 'Channel Name Update Failed', playSound: false, notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
  }
});

ipcRenderer.on('ChannelIconUpdated', (channelID: string) => {
  if (channelID != null) {
    new AppNotification({ title: 'Channel Icon Updated', playSound: false, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
  }
  else {
    new AppNotification({ title: 'Channel Icon Update Failed', playSound: false, notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
  }});

ipcRenderer.on('clientFocused', async () => {
  Manager.IsFocused = true;
});

ipcRenderer.on('clientUnfocused', () => {
  Manager.IsFocused = false;
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
});
