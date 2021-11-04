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
ipcRenderer.on('endAuth', (data: boolean) => {
  console.log(data);
  if (data) {
    Navigate('/chat', null);
    ipcRenderer.send('requestChannels');
    console.log("Sent requestChannels event, getting token and uuid next...")
    console.log(getCookie('userData'));
    const { token, uuid } = JSON.parse(getCookie('userData'));
    console.log("Setting token and uuid")
    GLOBALS.Token = token;
    GLOBALS.CurrentUserUUID = uuid;
    console.log(`${token} + ${uuid}`);
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
        ipcRenderer.send('requestMessage', event.Channel, event.Message);
      }
      else if (event.EventType == 3) {
        events.send('receivedChannelCreatedEvent', event.Channel);
      }
    };
    socket.onerror = function (error) {
      console.error("Socket closed unexpectedly");
    };
    socket.onopen = function () {
      socket.send(token);
      console.warn("Socket opened")
    };
    socket.onclose = function (event) {
      console.warn(event);
    }
    return true;
  }
  else {

  }
});

//ipcRenderer.on('receivedChannelData', (data: string) => LoadMessageFeed(data));
