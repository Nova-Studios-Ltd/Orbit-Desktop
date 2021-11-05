import { IMessageDeleteRequestArgs, INotificationProps } from 'dataTypes/interfaces';
import { NotificationStatusType } from 'dataTypes/enums';
import { clipboard, ipcMain, net, session, Notification } from 'electron';
import Credentials from '../dataTypes/Credentials';
import { FormAuthStatusType } from '../dataTypes/enums';
import TimeoutUntil from './timeout';

const { request } = net;

ipcMain.handle('beginAuth', async (event, creds: Credentials, url: string) => {
  let result = FormAuthStatusType.unknown;
  const re = request({
    method: 'POST',
    url: `https://api.novastudios.tk/Login`
  });
  re.setHeader('Content-Type', 'application/json');
  re.on('response', (response) => {
    response.on('data', (json) => {
      console.log(url);
      const cookie = {url: url, name: 'userData', value: json.toString(), expirationDate: new Date().getTime() + 30*24*60*60*1000 };
      session.defaultSession.cookies.set(cookie).then(() =>
      {
        const json_obj = JSON.parse(json.toString());
        if (json_obj.token != null) {
          event.sender.send('endAuth', true);
          console.log(json_obj);
          result = FormAuthStatusType.success;
        }
        event.sender.send('endAuth', false);
        result = FormAuthStatusType.genericIncorrectUsernamePassword;
      }).catch((e) =>
      {
        console.error(e);
        event.sender.send('endAuth', false);
        result = FormAuthStatusType.serverError;
      });
    });
  });
  re.on('error', (error) => {
    console.log(error);
    result = FormAuthStatusType.networkTimeout;
  });
  const data = JSON.stringify({password: creds.password, email: creds.email})
  re.write(data);
  re.end();

  await TimeoutUntil(result, 6, true);

  return result;
});

ipcMain.handle('register', async (event, creds: Credentials) => {
  let result = null;
  const re = request({method: 'POST', url: `https://api.novastudios.tk/Register`});
  //const re = request({method: 'POST', url: `https://localhost:44365/Register`});
  re.setHeader('Content-Type', 'application/json');
  re.on('error', (error) => {
    console.error(error);
    result = false;
  });
  re.on('response', (response) => {
    response.on('data', (data) => {
      let json = JSON.parse(data.toString());
      if (response.statusCode == 200 && json.status == undefined) {
        result = true;
      }
      else {
        result = false;
      }
    })
  });
  const data = JSON.stringify({username: creds.username, password: creds.password, email: creds.email})
  re.write(data);
  re.end();

  await TimeoutUntil(result, null, true);
  return result;
});

ipcMain.on('requestChannels', (event, channel_uuid: string) => {
  const re = request({
    method: 'GET',
    url: `https://api.novastudios.tk/User/Channels`,
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.on('response', (response) => {
      response.on('data', (json) => {
        if (response.statusCode != 200) return;
        event.sender.send('receivedChannels', json.toString());
      });
    });
    re.on('error', (error) => {
      console.error(error);
    });
    re.end();
    return true;
  }).catch((error) => {console.error(error)});
});

ipcMain.on('requestMessage', (event, channel_uuid: string, message_id: string) => {
  const re = request({
    method: 'GET',
    url: `https://api.novastudios.tk/Message/${channel_uuid}/Messages/${message_id}`,
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.on('response', (response) => {
      response.on('data', (json) => {
        if (response.statusCode != 200) return;
        console.log(json.toString());
        event.sender.send('receivedMessageEditEvent', message_id, JSON.parse(json.toString()));
      });
    });
    re.on('error', (error) => {
      console.error(error);
    });
    re.end();
    return true;
  }).catch((error) => {console.error(error)});
})

ipcMain.on('requestChannelInfo', (event, channel_uuid: string) => {
  const re = request({
    method: 'GET',
    url: `https://api.novastudios.tk/Channel/${channel_uuid}`,
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.on('response', (response) => {
      response.on('data', (json) => {
        if (response.statusCode != 200) return;
        event.sender.send('receivedChannelInfo', json.toString());
      });
    });
    re.on('error', (error) => {
      console.error(error);
    });
    re.end();
    return true;
  }).catch((error) => {console.error(error)});
});

ipcMain.on('requestChannelData', (event, channel_uuid: string) => {
  const re = request({
    method: 'GET',
    url: `https://api.novastudios.tk/Message/${channel_uuid}/Messages`,
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.on('response', (response) => {
      response.on('data', (json) => {
        if (response.statusCode != 200) return;
        event.sender.send('receivedChannelData', json.toString());
      });
    });
    re.on('error', (error) => {
      console.error(error);
    });
    re.end();
    return true;
  }).catch((error) => {console.error(error)});
});

ipcMain.on('requestChannelMessagePreview', (event, channel_uuid: string) => {
  console.log(`requestChannelMessagePreview called for channel ${channel_uuid}`);
  const re = request({
    method: 'GET',
    url: `https://api.novastudios.tk/Message/${channel_uuid}/Messages`,
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.on('response', (response) => {
      response.on('data', (json) => {
        if (response.statusCode != 200) return;
        console.log(json.toString());
        event.sender.send('receivedChannelMessagePreview', json.toString());
      });
    });
    re.on('error', (error) => {
      console.error(error);
    });
    re.end();
    return true;
  }).catch((error) => {console.error(error)});
});

ipcMain.on('sendMessageToServer', (event, channel_uuid: string, contents: string) => {
  console.log(channel_uuid);
  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    const data = JSON.stringify({Content: contents})
    const re = request({
      method: 'POST',
      url: `https://api.novastudios.tk/Message/${channel_uuid}/Messages`
    });
    re.setHeader('Authorization', token);
    re.setHeader('Content-Type', 'application/json');
    re.on('error', (error) => {
      console.error(error);
    });
    re.on('response', (response) => {
      console.log(response.statusCode);
    })
    re.write(data);
    re.end();
    return true;
  }).catch((error) => {console.error(error)});
});

ipcMain.on('requestChannelUpdate', (event, channel_uuid: string, message_id: string) => {
  const re = request({
    method: 'GET',
    url: `https://api.novastudios.tk/Message/${channel_uuid}/Messages/${message_id}`,
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.on('response', (response) => {
      response.on('data', (json) => {
        if (response.statusCode != 200) return;
        console.log('Got channel update');
        event.sender.send('receivedChannelUpdateEvent', json.toString());
      });
    });
    re.on('error', (error) => {
      console.error(error);
    });
    re.end();
    return true;
  }).catch((error) => {console.error(error)});
});

ipcMain.handle('requestDeleteMessage', async (event, data: IMessageDeleteRequestArgs) => {
  let result = false;

  const re = request({
    method: 'DELETE',
    url: `https://api.novastudios.tk/Message/${data.channelID}/Messages/${data.messageID}`,
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.on('error', (error) => {
      console.error(error);
    });
    re.end();
    result = true;
  }).catch((error) => {console.error(error)});

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
  const re = request({
    method: 'GET',
    url: `https://api.novastudios.tk/User/${user_uuid}`,
  });

  session.defaultSession.cookies.get({name: 'userData'}).then((userData) => {
    const { token } = JSON.parse(userData[0].value);
    re.setHeader('Authorization', token);
    re.on('response', (response) => {
      response.on('data', (json) => {
        if (response.statusCode != 200) return;
        event.sender.send('receivedUserData', json.toString());
      });
    });
    re.on('error', (error) => {
      console.error(error);
    });
    re.end();
    return true;
  }).catch((error) => {console.error(error)});
});
