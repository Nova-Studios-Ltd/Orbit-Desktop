import { IMessageDeleteRequestArgs, INotificationProps } from 'types/interfaces';
import { clipboard, ipcMain, net, session, Notification } from 'electron';
import Credentials from '../structs/Credentials';
import { ContentType, FormAuthStatusType } from '../types/enums';
import TimeoutUntil from './timeout';
import { DeleteWithAuthentication, PostWithAuthentication, QueryWithAuthentication } from './NCAPI';

const { request } = net;

ipcMain.handle('beginAuth', async (event, creds: Credentials, url: string) => {
  let result = FormAuthStatusType.unknown;

  PostWithAuthentication('Login', ContentType.JSON, JSON.stringify({password: creds.password, email: creds.email}), (resp, json) => {
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
      session.defaultSession.cookies.set({url: url, name: 'userData', value: json.toString(), expirationDate: new Date().getTime() + 30*24*60*60*1000 }).then(() => {
        const json_obj = JSON.parse(json.toString());
        if (json_obj.token != null) {
          event.sender.send('endAuth', true);
          result = FormAuthStatusType.success;
        }
        else {
          event.sender.send('endAuth', false);
          result = FormAuthStatusType.genericIncorrectUsernamePassword;
        }
      }).catch((e) => {
        event.sender.send('endAuth', false);
        result = FormAuthStatusType.serverError;
      })
    }
  }, (e) => {
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

  PostWithAuthentication('Register', ContentType.JSON, JSON.stringify({username: creds.username, password: creds.password, email: creds.email}), (resp, json) => {
    let j = JSON.parse(json.toString());
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
    console.log(json.toString());
    event.sender.send('receivedMessageEditEvent', message_id, JSON.parse(json.toString()));
  }

  QueryWithAuthentication(`/Message/${channel_uuid}/Messages/${message_id}`, onSuccess);
})

ipcMain.on('requestChannelInfo', (event, channel_uuid: string) => {
  function onSuccess(response: Electron.IncomingMessage, json: Buffer) {
    if (response.statusCode != 200) return;
    event.sender.send('receivedChannelInfo', json.toString());
  }

  QueryWithAuthentication(`/Channel/${channel_uuid}`, onSuccess);
});

let d = 0;
ipcMain.on('requestChannelData', (event, channel_uuid: string) => {
  console.log('Requesting channel data...')
  d = 0;
  function onSuccess(response: Electron.IncomingMessage, json: Buffer) {
    if (response.statusCode != 200) return;
    console.log(`Got channel data for the ${d} time`)
    event.sender.send('receivedChannelData', json.toString());
  }

  QueryWithAuthentication(`/Message/${channel_uuid}/Messages`, onSuccess);
});

ipcMain.on('requestChannelMessagePreview', (event, channel_uuid: string) => {
  console.log(`requestChannelMessagePreview called for channel ${channel_uuid}`);

  QueryWithAuthentication(`Message/${channel_uuid}/Messages`, (resp, json) => {
    if (resp.statusCode != 200) return;
    event.sender.send('receivedChannelMessagePreview', json.toString());
  });
});

ipcMain.on('sendMessageToServer', (event, channel_uuid: string, contents: string) => {
  console.log(channel_uuid);

  PostWithAuthentication(`Message/${channel_uuid}/Messages`, ContentType.JSON, JSON.stringify({Content: contents}));
});

ipcMain.on('requestChannelUpdate', (event, channel_uuid: string, message_id: string) => {
  QueryWithAuthentication(`Message/${channel_uuid}/Messages/${message_id}`, (resp, json) => {
    if (resp.statusCode != 200) return;
    event.sender.send('receivedChannelUpdateEvent', json.toString());
  });
});

ipcMain.handle('requestDeleteMessage', async (event, data: IMessageDeleteRequestArgs) => {
  let result = false;

  DeleteWithAuthentication(`Message/${data.channelID}/Messages/${data.messageID}`);
  result = true;

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
  const users_raw: string = data.recipients;
  const users = users_raw.split(' ');

  const re = request({
    method: 'POST',
    url: users.length == 1? `https://api.novastudios.tk/Channel/CreateChannel?recipient_uuid=${users[0]}` : `https://api.novastudios.tk/Channel/CreateGroupChannel?group_name=${name}`,
  });
  if (users.length == 1) {
    session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
      const { token } = JSON.parse(userData[0].value);
      re.setHeader('Authorization', token);
      re.on('response', (response) => {
        if (response.statusCode != 200) {
          event.sender.send('channelCreationSucceded', false);
          return;
        }
        event.sender.send('channelCreationSucceded', true);
      });
      re.on('error', (error) => {
        console.error(error);
      });
      re.end();
      return true;
    }).catch((error) => {console.error(error)});
  }
  else {
    session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
      const { token } = JSON.parse(userData[0].value);
      re.setHeader('Authorization', token);
      re.setHeader('Content-Type', 'application/json');
      re.on('error', (error) => {
        console.error(error);
      });
      re.on('response', (response) => {
        if (response.statusCode != 200) {
          event.sender.send('channelCreationSucceded', false);
          return;
        }
        event.sender.send('channelCreationSucceded', true);
      })
      re.write(JSON.stringify(users));
      re.end();
      return true;
    }).catch((error) => {console.error(error)});
  }
});
