import { clipboard, dialog, ipcMain, net, session, Notification, remote } from 'electron';
import type { IChannelProps, IMessageDeleteRequestArgs, IMessageProps, INotificationProps } from 'types/interfaces';

import Credentials from '../structs/Credentials';
import { ChannelType, ContentType, FormAuthStatusType, LogContext } from '../types/enums';
import TimeoutUntil from './timeout';
import { DeleteWithAuthentication, PostWithAuthentication, QueryWithAuthentication, PostWithoutAuthentication, PutWithAuthentication, PostFileWithAuthentication } from './NCAPI';
import { DebugMain } from '../shared/DebugLogger';


const { request } = net;

ipcMain.handle('beginAuth', async (event, creds: Credentials, url: string) => {
  let result = FormAuthStatusType.unknown;
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
    DebugMain.Error(e.message, LogContext.Main, 'when authenticating user');
    result = FormAuthStatusType.networkTimeout;
  });

  await TimeoutUntil(result, 6, true);

  return result;
});

ipcMain.on('logout', (event) => {
  session.defaultSession.cookies.remove('http://localhost', 'userData');
});

ipcMain.handle('register', async (event, creds: Credentials) => {
  let result = null;

  PostWithoutAuthentication('Register', ContentType.JSON, JSON.stringify({username: creds.username, password: creds.password, email: creds.email}), (resp, json) => {
    const j = JSON.parse(json.toString());
    if (resp.statusCode == 200 && j.status == undefined) {
      result = true;
    }
    else {
      result = false;
    }
  }, (e) => {
    result = false;
  });

  await TimeoutUntil(result, null, true);
  return result;
});

ipcMain.on('requestChannels', (event, channel_uuid: string) => {
  function onSuccess(response: Electron.IncomingMessage, json: Buffer) {
    if (response.statusCode != 200) return;
    event.sender.send('receivedChannels', json.toString());
  }
  QueryWithAuthentication('/User/Channels', onSuccess);
});

ipcMain.on('requestMessage', (event, channel_uuid: string, message_id: string) => {
  function onSuccess(response: Electron.IncomingMessage, json: Buffer) {
    if (response.statusCode != 200) return;
    try {
      const message = JSON.parse(json.toString());
      event.sender.send('receivedMessageEditEvent', channel_uuid, message_id, message);
    }
    catch {
      DebugMain.Error(`Unable to parse message ${message_id}`, LogContext.Main, 'when requesting message from server');
    }
  }

  QueryWithAuthentication(`/Message/${channel_uuid}/Messages/${message_id}`, onSuccess);
})

ipcMain.on('requestChannelInfo', (event, channel_uuid: string) => {
  function onSuccess(response: Electron.IncomingMessage, json: Buffer) {
    if (response.statusCode != 200) return;
    event.sender.send('receivedChannelInfo', <IChannelProps>JSON.parse(json.toString()));
  }

  QueryWithAuthentication(`/Channel/${channel_uuid}`, onSuccess);
});

ipcMain.on('requestChannelData', (event, channel_uuid: string) => {
  function onSuccess(response: Electron.IncomingMessage, json: Buffer) {
    if (response.statusCode != 200) return;
    try {
      const channelData = <IMessageProps>JSON.parse(json.toString())
      event.sender.send('receivedChannelData', channelData, channel_uuid);
    }
    catch {
      DebugMain.Error(`Unable to parse channel data ${channel_uuid}`, LogContext.Main, 'when requesting channel data from server');
    }

  }

  QueryWithAuthentication(`/Message/${channel_uuid}/Messages`, onSuccess, (e) => DebugMain.Error(e.message, LogContext.Main));
});

ipcMain.on('requestChannelMessagePreview', (event, channel_uuid: string) => {
  QueryWithAuthentication(`Message/${channel_uuid}/Messages`, (resp, json) => {
    if (resp.statusCode != 200) return;
    event.sender.send('receivedChannelMessagePreview', json.toString());
  });
});

ipcMain.on('sendMessageToServer', (event, channel_uuid: string, contents: string, attachments: string[]) => {
  PostWithAuthentication(`Message/${channel_uuid}/Messages`, ContentType.JSON, JSON.stringify({Content: contents, Attachments: attachments}));
});

ipcMain.on('requestChannelUpdate', (event, channel_uuid: string, message_id: string) => {
  QueryWithAuthentication(`Message/${channel_uuid}/Messages/${message_id}`, (resp, json) => {
    if (resp.statusCode != 200) return;
    event.sender.send('receivedChannelUpdateEvent', <IMessageProps>JSON.parse(json.toString()), channel_uuid);
  });
});

ipcMain.handle('requestDeleteMessage', async (event, data: IMessageDeleteRequestArgs) => {
  let result = false;

  function onSuccess() {
    result = true;
  }

  DeleteWithAuthentication(`Message/${data.channelID}/Messages/${data.messageID}`, onSuccess, (e) => DebugMain.Error(e.message, LogContext.Main, 'when trying to delete message'));


  await TimeoutUntil(result, true, false);
  return result;
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

ipcMain.on('requestUserData', (event, user_uuid: string) => {
  QueryWithAuthentication(`User/${user_uuid}`, (resp, json) => {
    if (resp.statusCode != 200) return;
    event.sender.send('receivedUserData', json.toString());
  })
});

ipcMain.on('createChannel', (event, data: any) => {
  const name: string = data.channelName;
  const users_raw: {[username: string]: string} = data.recipients;
  const users = Object.values(users_raw);

  if (users.length == 1) {
    PostWithAuthentication(`Channel/CreateChannel?recipient_uuid=${users[0]}`, ContentType.EMPTY, '', (resp, json) => {
      if (resp.statusCode != 200) event.sender.send('channelCreationSucceded', false);
      else event.sender.send('channelCreationSucceded', true);
    });
  }
  else {
    PostWithAuthentication(`Channel/CreateGroupChannel?group_name=${name}`, ContentType.JSON, JSON.stringify(users), (resp, json) => {
      if (resp.statusCode != 200) event.sender.send('channelCreationSucceded', false);
      else event.sender.send('channelCreationSucceded', true);
    });
  }
});

ipcMain.handle('sendEditedMessage', async (event, data: any) => {
  let result = false;

  function onSuccess() {
    result = true;
  }

  const { channelID, messageID, message } = data;
  PutWithAuthentication(`Message/${channelID}/Messages/${messageID}`, ContentType.JSON, JSON.stringify({content: message}), onSuccess);

  await TimeoutUntil(result, true, false);
  return result;
});

ipcMain.on('removeUserFromChannel', (event, data: any) => {
  const { channelID, userID, channelType } = data;

  if (channelType == ChannelType.Group) {
    DeleteWithAuthentication(`/Channel/${channelID}/Members?recipient=${userID}`);
  }
  else
  {
    DeleteWithAuthentication(`/Channel/${channelID}`);
  }
});

ipcMain.handle('getUserUUID', async (event, username: string, discriminator: string) => {
  let result = '';

  QueryWithAuthentication(`/User/${username}/${discriminator}/UUID`, (res, json) => {
    if (res.statusCode != 200) result = 'UNKNOWN';
    else result = json.toString();
  });

  await TimeoutUntil(result, '', true);
  return result;
});

ipcMain.handle('retrieveChannelName', async (event, uuid: string) => {
  let result = '';

  QueryWithAuthentication(`/Channel/${uuid}`, (res, json) => {
    if (res.statusCode == 200 && json != null) {
      result = JSON.parse(json.toString()).channelName;
    }
  });
  await TimeoutUntil(result, '', true);
  return result;
});

ipcMain.on('pickUploadFiles', (event) => {
  dialog.showOpenDialog({ properties: ['openFile', 'multiSelections', 'showHiddenFiles'] }).then((r) => {
    if (!r.canceled) event.sender.send('pickedUploadFiles', r.filePaths);
  }).catch((e) => DebugMain.Error(e.message, LogContext.Main, 'when trying to retrieve paths from file picker for file uploading'));
});

ipcMain.handle('uploadFile', async (event, channel_uuid: string, file: string) => {
  let result = null;
  PostFileWithAuthentication(`Media/Channel/${channel_uuid}`, file, (id) =>
  {
    result = id;
    DebugMain.Log(id, LogContext.Main, 'file ID received from server');
  }, (e) =>
  {
    result = '';
    DebugMain.Error('Server returned blank file ID', LogContext.Main, 'when retrieving file ID from server');
  });
  await TimeoutUntil(result, null, true, 60);
  return result;
});

ipcMain.on('deleteAccount', (event, userID: string) => {
  DeleteWithAuthentication(`/User/${userID}`, () => {
    event.sender.send('userAccountDeleted', true);
  }, () => {
    event.sender.send('userAccountDeleted', false);
  });
});
