import { clipboard, dialog, ipcMain, session, Notification } from 'electron';
import type { IChannelProps, IMessageDeleteRequestArgs, IMessageProps, INotificationProps } from 'types/interfaces';
import Credentials from '../structs/Credentials';
import { ChannelType, ContentType, FormAuthStatusType } from '../types/enums';
import { DeleteWithAuthentication, PostWithAuthentication, QueryWithAuthentication, PostWithoutAuthentication, PutWithAuthentication, PostFileWithAuthentication, SetCookie } from './NCAPI';

ipcMain.handle('beginAuth', async (event, creds: Credentials) : Promise<FormAuthStatusType> => {
  const resp = await PostWithoutAuthentication('Login', ContentType.JSON, JSON.stringify({password: creds.password, email: creds.email}));
  if (resp.status == 403 || resp.status == 404) return FormAuthStatusType.genericIncorrectUsernamePassword;
  if (resp.status == 500) return FormAuthStatusType.serverError;
  if (resp.status == 200 && resp.payload != undefined && await SetCookie('userData', JSON.stringify(resp.payload))) {
    event.sender.send('endAuth', true);
    return FormAuthStatusType.success;
  }
  return FormAuthStatusType.serverError;
});

ipcMain.on('logout', () => {
  session.defaultSession.cookies.remove('http://localhost', 'userData');
});

ipcMain.handle('register', async (_event, creds: Credentials) : Promise<boolean> => {
  const resp = await PostWithoutAuthentication('Register', ContentType.JSON, JSON.stringify({username: creds.username, password: creds.password, email: creds.email}));
  if (resp.status == 200) return true;
  return false;
});

ipcMain.on('requestChannels', async (event) => {
  const resp = await QueryWithAuthentication('/User/Channels');
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedChannels', <string[]>resp.payload);
});

ipcMain.on('requestMessage', async (event, channel_uuid: string, message_id: string) => {
  const resp = await QueryWithAuthentication(`/Message/${channel_uuid}/Messages/${message_id}`);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedMessageEditEvent', channel_uuid, message_id, resp.payload);
})

ipcMain.on('requestChannelInfo', async (event, channel_uuid: string) => {
  const resp = await QueryWithAuthentication(`/Channel/${channel_uuid}`);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedChannelInfo', <IChannelProps>resp.payload);
});

ipcMain.on('requestChannelData', async (event, channel_uuid: string) => {
  const resp = await QueryWithAuthentication(`/Message/${channel_uuid}/Messages`);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedChannelData', <IMessageProps[]>resp.payload, channel_uuid);
});

ipcMain.on('requestChannelMessagePreview', async (event, channel_uuid: string) => {
  const resp = await QueryWithAuthentication(`Message/${channel_uuid}/Messages`);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedChannelMessagePreview', resp.payload);
});

ipcMain.on('sendMessageToServer', (_event, channel_uuid: string, contents: string, attachments: string[]) => {
  PostWithAuthentication(`Message/${channel_uuid}/Messages`, ContentType.JSON, JSON.stringify({Content: contents, Attachments: attachments}));
});

ipcMain.on('requestChannelUpdate', async (event, channel_uuid: string, message_id: string) => {
  const resp = await QueryWithAuthentication(`Message/${channel_uuid}/Messages/${message_id}`);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedChannelUpdateEvent', <IMessageProps>resp.payload, channel_uuid);
});

ipcMain.handle('requestDeleteMessage', async (_event, data: IMessageDeleteRequestArgs) => {
  const resp = await DeleteWithAuthentication(`Message/${data.channelID}/Messages/${data.messageID}`);
  if (resp.status == 200) return true;
  return false;
})

ipcMain.handle('copyToClipboard', async (_, data: string) => {
  try {
    clipboard.writeText(data);
    return true;
  } catch {
    return false;
  }
});

ipcMain.on('toast', (_, notification: INotificationProps) => {
  new Notification({ title: notification.title, body: notification.body }).show();
});

ipcMain.on('requestUserData', async (event, user_uuid: string) => {
  const resp = await QueryWithAuthentication(`User/${user_uuid}`);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedUserData', resp.payload);
});

ipcMain.on('createChannel', async (event, data: any) => {
  const name: string = data.channelName;
  const users_raw: {[username: string]: string} = data.recipients;
  const users = Object.values(users_raw);

  if (users.length == 1) {
    const resp = await PostWithAuthentication(`Channel/CreateChannel?recipient_uuid=${users[0]}`, ContentType.JSON, '');
    if (resp.status == 200) event.sender.send('channelCreationSucceded', true);
    else event.sender.send('channelCreationSucceded', false);
  }
  else {
    const resp = await PostWithAuthentication(`Channel/CreateGroupChannel?group_name=${name}`, ContentType.JSON, JSON.stringify(users));
    if (resp.status == 200) event.sender.send('channelCreationSucceded', true);
    else event.sender.send('channelCreationSucceded', false);
  }
});

ipcMain.handle('sendEditedMessage', async (_event, data: any) => {
  const { channelID, messageID, message } = data;
  const resp = await PutWithAuthentication(`Message/${channelID}/Messages/${messageID}`, ContentType.JSON, JSON.stringify({content: message}));
  if (resp.status == 200) return true;
  return false;
});

ipcMain.on('removeUserFromChannel', async (_event, data: any) => {
  const { channelID, userID, channelType } = data;

  if (channelType == ChannelType.Group) {
    await DeleteWithAuthentication(`/Channel/${channelID}/Members?recipient=${userID}`);
  }
  else
  {
    await DeleteWithAuthentication(`/Channel/${channelID}`);
  }
});

ipcMain.handle('getUserUUID', async (_event, username: string, discriminator: string) => {
  const resp = await QueryWithAuthentication(`/User/${username}/${discriminator}/UUID`);
  if (resp.status == 200 && resp.payload != undefined) return resp.payload;
  return 'UNKNOWN';
});

ipcMain.handle('retrieveChannelName', async (_event, uuid: string) => {
  const resp = await QueryWithAuthentication(`/Channel/${uuid}`);
  if (resp.status == 200 && resp.payload != undefined) return (<IChannelProps>resp.payload).channelName;
  return 'Failed to get channel name'
});

ipcMain.on('pickUploadFiles', (event) => {
  dialog.showOpenDialog({ properties: ['openFile', 'multiSelections', 'showHiddenFiles'] }).then((r) => {
    if (!r.canceled) event.sender.send('pickedUploadFiles', r.filePaths);
  }).catch((e) => DebugMain.Error(e.message, LogContext.Main, 'when trying to retrieve paths from file picker for file uploading'));
});

ipcMain.handle('uploadFile', async (_event, channel_uuid: string, file: string) => {
  return PostFileWithAuthentication(`Media/Channel/${channel_uuid}`, file);
});

ipcMain.on('deleteAccount', async (event, userID: string) => {
  const resp = await DeleteWithAuthentication(`/User/${userID}`);
  if (resp.status == 200) event.sender.send('userAccountDeleted', true);
  else event.sender.send('userAccountDeleted', false);
});
