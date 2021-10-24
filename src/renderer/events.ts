import { ipcRenderer, Navigate, events } from './helpers';

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
    //ipcRenderer.send('requestChannelData', 'b1642a0175554994b3f593f191c610b5');
    console.log(getCookie('userData'));
    const { token, uuid } = JSON.parse(getCookie('userData'));
    //socket = new WebSocket(`wss://localhost:44365/Events/Listen?user_uuid=${uuid}`)
    socket = new WebSocket(`wss://api.novastudios.tk/Events/Listen?user_uuid=${uuid}`)
    socket.onmessage = function (message) {
      var event = JSON.parse(message.data);
      console.log(event);
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
