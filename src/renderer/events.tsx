import { ipcRenderer, Navigate } from './helpers';
import { LoadMessageFeed } from './helpers';

function getCookie(cname: string) {
  let name = cname + "=";
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
  return "";
}

let socket : WebSocket;
ipcRenderer.on('end_auth', (data: boolean) => {
  if (data) {
    Navigate("/chat");
    ipcRenderer.send('requestChannelData', 'b1642a0175554994b3f593f191c610b5');
    console.log(getCookie("userData"));
    const { token, uuid } = JSON.parse(getCookie("userData"));
    //socket = new WebSocket(`wss://localhost:44365/Events/Listen?user_uuid=${uuid}`)  
    socket = new WebSocket(`wss://api.novastudios.tk/Events/Listen?user_uuid=${uuid}`)
    socket.onmessage = function (message) {
      var event = JSON.parse(message.data);
      console.log(event);
      if (event.EventType == 0) {
        ipcRenderer.send('requestChannelUpdate', event.Channel, event.Message);
      }
    };
    socket.onerror = function (error) {
      console.error(error);
    };
    socket.onopen = function () {
      socket.send("Test");
    };
    socket.onclose = function (event) {
      console.log(event);
    }
    return true;
  }
});

//ipcRenderer.on('receivedChannelData', (data: string) => LoadMessageFeed(data));