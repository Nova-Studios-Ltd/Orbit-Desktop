import GLOBALS from 'shared/globals';
import { ipcRenderer, Navigate, events } from '../shared/helpers';

function getCookie(cname: string) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

let socket : WebSocket;
ipcRenderer.on('end_auth', (data: boolean) => {
  if (data) {
    Navigate('/chat', null);
    ipcRenderer.send('requestChannels');
    const { token, uuid } = JSON.parse(getCookie('userData'));
    GLOBALS.Token = token;
    GLOBALS.CurrentUserUUID = uuid;
    socket = new WebSocket(`wss://api.novastudios.tk/Events/Listen?user_uuid=${uuid}`)
    socket.onmessage = function (message) {
      var event = JSON.parse(message.data);
      if (event.EventType == -1) {
        console.log('<Beat>')
      }
      else if (event.EventType == 0) {
        ipcRenderer.send('requestChannelUpdate', event.Channel, event.Message);
      }
      else if (event.EventType == 1) {
        events.send('receivedMessageDeleteEvent', event.Channel, event.Message);
      }
      else if (event.EventType == 2) {

      }
      else if (event.EventType == 3) {
        events.send('receivedChannelCreatedEvent', event.Channel);
      }
    };
    socket.onerror = function (error) {
      console.error(error);
    };
    socket.onopen = function () {
      socket.send(token);
    };
    socket.onclose = function (event) {
      console.log(event);
    }
    return true;
  }
  else {

  }
});

//ipcRenderer.on('receivedChannelData', (data: string) => LoadMessageFeed(data));
