import { ipcRenderer, Navigate, RemoveCachedCredentials, Debug, Manager, FetchUserData } from 'renderer/helpers';
import AppNotification from 'renderer/components/Notification/Notification';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';
import { RSAMemoryKeyPair } from 'main/encryptionClasses';
import { Dictionary } from 'main/dictionary';

ipcRenderer.on('endAuth', async (privKey: string, pubKey: string, uuid: string, token: string) => {
  Manager.UserData.keyPair = new RSAMemoryKeyPair(privKey, pubKey);

  // Store Pub/Priv key
  if (await ipcRenderer.invoke('SetPrivkey', privKey) && ipcRenderer.invoke('SetPubkey', pubKey)) {

    Debug.Success('Public/Private key store successfully');

    Manager.WriteSettingTable('User', 'UUID', uuid);
    Manager.WriteSettingTable('User', 'Token', token);
    await Manager.Save();

    await ipcRenderer.invoke('SaveKeystore', JSON.stringify(<Dictionary<string>>await ipcRenderer.invoke('GETKeystore', uuid)));

    // HACK Also handles moving the client to the chat page, should probably change this
    FetchUserData();
  }
  else {
    Debug.Error('Unable to store public key. Aborting login...', 'when writing public key to file');
  }
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
    new AppNotification({ title: 'Unable to Update Channel Name', playSound: false, notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
  }
});

ipcRenderer.on('ChannelIconUpdated', (channelID: string) => {
  if (channelID != null) {
    new AppNotification({ title: 'Channel Icon Updated', playSound: false, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
  }
  else {
    new AppNotification({ title: 'Unable to Update Channel Icon', playSound: false, notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
}});

ipcRenderer.on('ChannelArchived', (channelID: string) => {
  if (channelID != null) {
    new AppNotification({ title: 'Channel Archived', playSound: false, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
  }
  else {
    new AppNotification({ title: 'Unable to Archive Channel', playSound: false, notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
}});

ipcRenderer.on('clientFocused', async () => {
  Manager.WriteConst("IsFocused", true);
  //Manager.IsFocused = true;
});

ipcRenderer.on('clientUnfocused', () => {
  Manager.WriteConst("IsFocused", true);
  //Manager.IsFocused = false;
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
