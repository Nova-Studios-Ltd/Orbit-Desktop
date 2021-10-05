import { ipcMain, net, session } from 'electron';
import Credentials from '../renderer/Credentials';

const { request } = net;

ipcMain.on('begin_auth', (event, data: Credentials) => {
  const re = request({
    method: "GET",
    url: `https://api.novastudios.tk/Login?username=${data.username}&password=${data.password}`
  });
  re.on('response', (response) => {
    response.on("data", (json) => {
      const cookie = {url: 'http://localhost', name: 'userData', value: json.toString(), expirationDate: new Date().getTime() + 30*24*60*60*1000 };
      session.defaultSession.cookies.set(cookie).then(() => 
      {
        event.sender.send("end_auth", true);
        return null;
      }).catch((e) => 
      {
        console.error(e);
        event.sender.send("end_auth", false);
      });
    });
  });
  re.on("error", (error) => {
    console.log(error);
  });
  re.end();
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

ipcMain.on('sendMessageToServer', (event, channel_uuid: string, contents: string) => {
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
})
