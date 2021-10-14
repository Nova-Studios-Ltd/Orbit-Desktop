import React from 'react';
import { Helmet } from 'react-helmet';
import Message from './Message';
import MessageCanvas from './MessageCanvas';
import { Logout, LoadMessageFeed, ipcRenderer, events } from '../../helpers';
import ChannelView from './ChannelView';
import MessageInput from './MessageInput';
import UIHeader from './UIHeader';

export default class Chat extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { CanvasObject: null};
    this.init = this.init.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.appendToCanvas = this.appendToCanvas.bind(this);
    this.onReceivedChannelData = this.onReceivedChannelData.bind(this);
  }

  init(e: MessageCanvas) {
    if (e != null) {
      this.setState({CanvasObject: e});
      ipcRenderer.on('receivedChannelData', (data: string) => this.onReceivedChannelData(LoadMessageFeed(data)));
      ipcRenderer.on('receivedChannelUpdateEvent', (data: string) => this.onReceivedChannelData([JSON.parse(data)]));

      ipcRenderer.on('receivedMessageEditEvent', (id: string, data: string) => this.onReceivedMessageEdit(id, data));
      events.on('receivedMessageDeleteEvent', (channel_uuid: string, message_id: string) => this.onReceivedMessageDelete(channel_uuid, message_id));
    }
    else {
      console.error("Message canvas initialization error.")
    }
  }

  appendToCanvas(message: JSON) {
    console.log(message);
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      const msgObj = new Message({ message: message.content, author: message.author, uuid: message.message_Id, avatarSrc: `https://api.novastudios.tk/Media/Avatar/${message.author_UUID}?size=64` });
      canvas.append(msgObj);
    }
    else {
      console.error("Canvas is null");
    }
  }

  onReceivedChannelData(messages: JSON[]) {
    for (let index = 0; index < messages.length; index++) {
      let message = messages[index];
      this.appendToCanvas(message);
    }
  }

  onReceivedMessageEdit(id: string, data: string) {
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      canvas.edit(id, data);
    }
  }

  onReceivedMessageDelete(channel_uuid: string, message_id: string) {
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      canvas.remove(message_id);
    }
  }

  sendMessage(message: string) {
    if (message.length > 0)
    {
      console.log(`Message Sent: ${message}`);
      ipcRenderer.send('sendMessageToServer', 'b1642a0175554994b3f593f191c610b5', message);
    }
  }

  render() {
    return (
      <div className="Chat_Page_Container">
        <Helmet>
          <title>Chat</title>
        </Helmet>
        <div className="Chat_Page_Body">
          <div className="Chat_Page_Body_Left">
            <UIHeader />
            <ChannelView />
          </div>
          <div className="Chat_Page_Body_Right">
            <UIHeader />
            <MessageCanvas init={this.init}/>
            <MessageInput onMessagePush={this.sendMessage}/>
          </div>
        </div>
      </div>
    );
  }
}
