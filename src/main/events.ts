import { clipboard, dialog, ipcMain, session, Notification } from 'electron';
import fs from 'fs';
import type { IChannelProps, IMessageDeleteRequestArgs, IMessageProps, INotificationProps } from 'types/interfaces';
import MessageAttachment from 'structs/MessageAttachment';
import Credentials from '../structs/Credentials';
import { DebugMain } from '../shared/DebugLogger';
import { ChannelType, ContentType, FormAuthStatusType, LogType, LogContext } from '../types/enums';
import { DeleteWithAuthentication, PostWithAuthentication, QueryWithAuthentication, PostWithoutAuthentication, PutWithAuthentication, PostFileWithAuthentication, SetCookie, PostBufferWithAuthentication, NCAPIResponse } from './NCAPI';

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
  QueryWithAuthentication(`/Message/${channel_uuid}/Messages/${message_id}`).then((resp: NCAPIResponse) => {
    if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedMessageEditEvent', channel_uuid, message_id, resp);
  });
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

ipcMain.on('sendMessageToServer', async (_event, channel_uuid: string, contents: string, attachments: string[]) => {
  console.log(JSON.stringify({Content: contents, Attachments: attachments}));
  console.log(await PostWithAuthentication(`Message/${channel_uuid}/Messages`, ContentType.JSON, JSON.stringify({Content: contents, Attachments: attachments})));
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

ipcMain.handle('copyImageFromClipboard', async () => {
  try {
    return clipboard.readImage().toPNG().toString('binary');
  }
  catch{
    return null;
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

ipcMain.handle('uploadFile', async (_event, channel_uuid: string, attachments: string) => {
  const file = <MessageAttachment>JSON.parse(attachments);
  console.log(file);
  if (!file.isBuffer)
    return PostFileWithAuthentication(`Media/Channel/${channel_uuid}`, file.contents);
  return PostBufferWithAuthentication(`Media/Channel/${channel_uuid}`, Buffer.from(file.contents));
});

ipcMain.on('deleteAccount', async (event, userID: string) => {
  const resp = await DeleteWithAuthentication(`/User/${userID}`);
  if (resp.status == 200) event.sender.send('userAccountDeleted', true);
  else event.sender.send('userAccountDeleted', false);
});

ipcMain.handle('saveSetting', (key: string, value: string | boolean | number) => {
  //fs.writeFile('settings.json', );
  // Store settings in an object andy, and serialize that to disk when you need to save, unless were gonna store like a gb of settings
  // You will have to rewrite the entire file anyways to update a single setting, unless you spend the time update just that location in the file
  // Perhaps make yourself a SettingsManager class that handles are the control logic
  // And these events, help keep this file cleaner maybe?
});

ipcMain.on('retrieveSetting', (key: string) => {

});


// User

// TODO Move begin auth event

ipcMain.handle('GETUser', async (_event, user_uuid: string) => {
  const resp = await QueryWithAuthentication(`User/${user_uuid}`);
  return resp.payload;
});

ipcMain.on('GETUserChannels', async (event) => {
  const resp = await QueryWithAuthentication('/User/Channels');
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('');
});

ipcMain.handle('GETUserUUID', async (event, username: string, discriminator: string) => {
  const resp = await QueryWithAuthentication(`/User/${username}/${discriminator}/UUID`);
  if (resp.status == 200 && resp.payload != undefined) return resp.payload;
  return 'UNKNOWN';
});

// TODO Add type for 'data'
ipcMain.on('EDITUser', (event, user_uuid: string, data: any) => {
  
});

ipcMain.on('DELETEUser', async (event, user_uuid: string) => {
  const resp = await DeleteWithAuthentication(`/User/${user_uuid}`);
  if (resp.status == 200) event.sender.send('UserDeleted', true);
  else event.sender.send('UserDeleted', false);
});


// Messages
ipcMain.handle('GETMessage', async (_event, channel_uuid: string, message_id: string) => {
  const resp = await QueryWithAuthentication(`/Message/${channel_uuid}/Messages/${message_id}`);
  if (resp.status == 200 && resp.payload != undefined) return resp.payload;
  return undefined;
});

ipcMain.on('GETMessages', async (event, channel_uuid: string) => {
  const resp = await QueryWithAuthentication(`/Message/${channel_uuid}/Messages`);
  if (resp.payload == 200 && resp.payload != undefined) event.sender.send('GotMessages', <IMessageProps[]>resp.payload, channel_uuid);
});

ipcMain.on('SENDMessage', (event, channel_uuid: string) => {

});

// TODO Change 'data' to have a proper type
ipcMain.on('EDITMessage', (event, channel_uuid: string, message_id: string, data: any) => {

});

ipcMain.on('DELETEMessage', (event, channel_uuid: string, message_id: string) => {

});

// Channels
ipcMain.handle('GETChannel', (event, channel_uuid: string) => {

});

ipcMain.on('CREATEChannel', (event, recipient_uuid: string) => {

});

ipcMain.on('CREATEGroupChannel', (event, groupName: string, receipients: string[]) => {

});

ipcMain.on('UPDATEChannelName', (event, newName: string) => {

});

ipcMain.on('ADDChannelMember', (event, recipient_uuid: string) => {

});

ipcMain.on('ARCHIVEChannel', (event, channel_uuid: string) => {

});

ipcMain.on('UNARCHIVEChannel', (event, channel_uuid: string) => {

});

ipcMain.on('DELETEChannel', (event, channel_uuid: string) => {

});

ipcMain.on('REMOVEChannelMember', (event, channel_uuid: string, recipient: string) => {

});

// Media
ipcMain.on('SETAvatar', (event, user_uuid: string, file: string) => {

});

ipcMain.on('SETChannelIcon', (event, channel_uuid: string, file: string) => {

});

ipcMain.handle('POSTChannelContent', (event, channel_uuid: string, file: string) => {

});
