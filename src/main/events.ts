import { clipboard, dialog, ipcMain, net, session, Notification } from 'electron';
import type { IChannelProps, IMessageDeleteRequestArgs, IMessageProps, INotificationProps } from 'types/interfaces';

import Credentials from '../structs/Credentials';
import { ChannelType, ContentType, FormAuthStatusType } from '../types/enums';
import TimeoutUntil from './timeout';
import { DeleteWithAuthentication, PostWithAuthentication, QueryWithAuthentication, PostWithoutAuthentication, PutWithAuthentication, PostFileWithAuthentication, SetCookie } from './NCAPI';


const { request } = net;

ipcMain.handle('beginAuth', async (event, creds: Credentials, url: string) : Promise<FormAuthStatusType> => {
  /*let result = FormAuthStatusType.unknown;
    PostWithoutAuthentication('Login', ContentType.JSON, JSON.stringify({password: creds.password, email: creds.email}), (resp, json) => {
    if (resp.statusCode == 403 || resp.statusCode == 404) {
      event.sender.send('endAuth', false);
      result = FormAuthStatusType.genericIncorrectUsernamePassword;
      return;
    }
    if (resp.statusCode == 500) {
      event.sender.send('endAuth', false);
      result = FormAuthStatusType.serverError;
      return;
    }
    if (resp.statusCode == 200) {
      session.defaultSession.cookies.set({url: 'http://localhost', name: 'userData', value: json.toString(), expirationDate: new Date().getTime() + 30*24*60*60*1000 }).then(() => {
        const json_obj = JSON.parse(json.toString());
        if (json_obj.token != null) {
          event.sender.send('endAuth', true);
          result = FormAuthStatusType.success;
        }
        else {
          event.sender.send('endAuth', false);
          result = FormAuthStatusType.genericIncorrectUsernamePassword;
        }
        return true;
      }).catch((e) => {
        event.sender.send('endAuth', false);
        result = FormAuthStatusType.serverError;
      })
    }
  }, (e) => {
    console.error(e.message);
    result = FormAuthStatusType.networkTimeout;
  });*/

  const resp = await PostWithoutAuthentication('Login', ContentType.JSON, JSON.stringify({password: creds.password, email: creds.email}));
  if (resp.status == 403 || resp.status == 404) return FormAuthStatusType.genericIncorrectUsernamePassword;
  if (resp.status == 500) return FormAuthStatusType.serverError;
  if (resp.status == 200 && resp.payload != undefined && await SetCookie('userData', JSON.stringify(resp.payload))) {
    event.sender.send('endAuth', true);
    return FormAuthStatusType.success;
  }
  return FormAuthStatusType.serverError;
});

ipcMain.on('logout', (event) => {
  session.defaultSession.cookies.remove('http://localhost', 'userData');
});

ipcMain.handle('register', async (event, creds: Credentials) : Promise<boolean> => {
  /*PostWithoutAuthentication('Register', ContentType.JSON, JSON.stringify({username: creds.username, password: creds.password, email: creds.email}), (resp, json) => {
    const j = JSON.parse(json.toString());
    if (resp.statusCode == 200 && j.status == undefined) {
      result = true;
    }
    else {
      result = false;
    }
  }, (e) => {
    result = false;
  });*/

  const resp = await PostWithoutAuthentication('Register', ContentType.JSON, JSON.stringify({username: creds.username, password: creds.password, email: creds.email}));
  if (resp.status == 200) return true;
  return false;
});

ipcMain.on('requestChannels', async (event, channel_uuid: string) => {
  const resp = await QueryWithAuthentication('/User/Channels');
  console.log(resp.payload);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedChannels', <string[]>resp.payload);
});

ipcMain.on('requestMessage', async (event, channel_uuid: string, message_id: string) => {
  const resp = await QueryWithAuthentication(`/Message/${channel_uuid}/Messages/${message_id}`);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedMessageEditEvent', channel_uuid, message_id, resp.payload);
})

ipcMain.on('requestChannelInfo', async (event, channel_uuid: string) => {
  const resp = await QueryWithAuthentication(`/Channel/${channel_uuid}`);
  console.log(resp.payload);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedChannelInfo', <IChannelProps>resp.payload);
});

ipcMain.on('requestChannelData', async (event, channel_uuid: string) => {
  const resp = await QueryWithAuthentication(`/Message/${channel_uuid}/Messages`);
  console.log(resp.payload);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedChannelData', <IMessageProps[]>resp.payload, channel_uuid);
});

ipcMain.on('requestChannelMessagePreview', async (event, channel_uuid: string) => {
  const resp = await QueryWithAuthentication(`Message/${channel_uuid}/Messages`);
  console.log(resp.payload);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedChannelMessagePreview', resp.payload);
});

ipcMain.on('sendMessageToServer', (event, channel_uuid: string, contents: string, attachments: string[]) => {
  PostWithAuthentication(`Message/${channel_uuid}/Messages`, ContentType.JSON, JSON.stringify({Content: contents, Attachments: attachments}));
});

ipcMain.on('requestChannelUpdate', async (event, channel_uuid: string, message_id: string) => {
  const resp = await QueryWithAuthentication(`Message/${channel_uuid}/Messages/${message_id}`);
  console.log(resp.payload);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('receivedChannelUpdateEvent', <IMessageProps>resp.payload, channel_uuid);
});

ipcMain.handle('requestDeleteMessage', async (event, data: IMessageDeleteRequestArgs) => {
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
  console.log(resp.payload);
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

ipcMain.handle('sendEditedMessage', async (event, data: any) => {
  const { channelID, messageID, message } = data;
  const resp = await PutWithAuthentication(`Message/${channelID}/Messages/${messageID}`, ContentType.JSON, JSON.stringify({content: message}));
  if (resp.status == 200) return true;
  return false;
});

ipcMain.on('removeUserFromChannel', async (event, data: any) => {
  const { channelID, userID, channelType } = data;

  if (channelType == ChannelType.Group) {
    await DeleteWithAuthentication(`/Channel/${channelID}/Members?recipient=${userID}`);
  }
  else
  {
    await DeleteWithAuthentication(`/Channel/${channelID}`);
  }
});

ipcMain.handle('getUserUUID', async (event, username: string, discriminator: string) => {
  const resp = await QueryWithAuthentication(`/User/${username}/${discriminator}/UUID`);
  console.log(resp.payload);
  if (resp.status == 200 && resp.payload != undefined) return resp.payload;
  return 'UNKNOWN';
});

ipcMain.handle('retrieveChannelName', async (event, uuid: string) => {
  const resp = await QueryWithAuthentication(`/Channel/${uuid}`);
  console.log(resp.payload);
  if (resp.status == 200 && resp.payload != undefined) return (<IChannelProps>resp.payload).channelName;
  return 'Failed to get channel name'
});

ipcMain.on('pickUploadFiles', (event) => {
  dialog.showOpenDialog({ properties: ['openFile', 'multiSelections', 'showHiddenFiles'] }).then((r) => {
    if (!r.canceled) event.sender.send('pickedUploadFiles', r.filePaths);
  }).catch((e) => console.log(e));
});

ipcMain.handle('uploadFile', async (event, channel_uuid: string, file: string) => {
  return PostFileWithAuthentication(`Media/Channel/${channel_uuid}`, file);
});

ipcMain.on('deleteAccount', async (event, userID: string) => {
  const resp = await DeleteWithAuthentication(`/User/${userID}`);
  if (resp.status == 200) event.sender.send('userAccountDeleted', true);
  else event.sender.send('userAccountDeleted', false);
});
