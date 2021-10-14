import React from 'react';
import { List as ListIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import Message from './Message';
import MessageCanvas from './MessageCanvas';
import { Logout, LoadMessageFeed, ipcRenderer, events } from '../../helpers';
import ChannelView from './ChannelView';
import Channel from './Channel';
import MessageInput from './MessageInput';
import UIHeader from './UIHeader';
import GLOBALS from '../../Globals'

export default class Chat extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { CanvasObject: null, ChannelList: null};
    this.initCanvas = this.initCanvas.bind(this);
    this.initChannelView = this.initChannelView.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.appendToCanvas = this.appendToCanvas.bind(this);
    this.onReceivedChannelData = this.onReceivedChannelData.bind(this);
  }

  initCanvas(canvas: MessageCanvas) {
    if (canvas != null) {
      this.setState({CanvasObject: canvas });

      ipcRenderer.on('receivedChannelData', (data: string) => this.onReceivedChannelData(LoadMessageFeed(data)));
      ipcRenderer.on('receivedChannelUpdateEvent', (data: string) => this.onReceivedChannelData([JSON.parse(data)]));

      ipcRenderer.on('receivedMessageEditEvent', (id: string, data: string) => this.onReceivedMessageEdit(id, data));
      events.on('receivedMessageDeleteEvent', (channel_uuid: string, message_id: string) => this.onReceivedMessageDelete(channel_uuid, message_id));
    }
    else {
      console.error("Message canvas initialization error.")
    }
  }

  initChannelView(channelList: ChannelView) {
    if (channelList != null) {
      this.setState({ChannelList: channelList }/*, () => this.addChannel(JSON.parse("{\"channelName\":\"Main Channel\", \"channelID\":\"0\"}"))*/);
      ipcRenderer.on('receivedChannels', (data: string) => this.onReceivedChannels(JSON.parse(data)));
      ipcRenderer.on('receivedChannelInfo', (data: string) => this.onReceivedChannelInfo(JSON.parse(data)));
    }
    else {
      console.error("Channel list initialization error.")
    }
  }

  onReceivedChannels(data: any) {
    for (let channel = 0; channel < data.length; channel++) {
      //this.addChannel({channelName: data[channel], channelID: data[channel]});
      ipcRenderer.send("requestChannelInfo", data[channel]);
    }
  }

  onReceivedChannelInfo(data: any) {
    if (data.isGroup)
      this.addChannel({channelName: data.groupName, channelID: data.table_Id});
    else
      this.addChannel({channelName: data.channelName, channelID: data.table_Id});
  }

  appendToCanvas(message: any) {
    console.log(message);
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      const msgObj = new Message({ message: message.content, author: message.author, uuid: message.message_Id, avatarSrc: `https://api.novastudios.tk/Media/Avatar/${message.author_UUID}?size=64` });
      canvas.append(msgObj);
    }
    else {
      console.error("(When Appending Message) Canvas is null");
    }
  }

  clearCanvas() {
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      canvas.clear();
    }
  }

  addChannel(channel: any) {
    const channelList = this.state.ChannelList;
    if (channelList != null) {
      const channelObj = new Channel({ channelName: channel.channelName, channelID: channel.channelID });
      channelList.addChannel(channelObj);
    }
    else {
      console.error("(When Adding Channel) ChannelList is null");
    }
  }

  onReceivedChannelData(messages: JSON[]) {
    this.clearCanvas();
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
      ipcRenderer.send('sendMessageToServer', GLOBALS.currentChannel, message);
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
            <UIHeader caption="Channels" icon={<ListIcon />} />
            <ChannelView init={this.initChannelView} />
          </div>
          <div className="Chat_Page_Body_Right">
          <UIHeader caption="Chat" icon={<LogoutIcon />} onClick={Logout} />
            <MessageCanvas init={this.initCanvas}/>
            <MessageInput onMessagePush={this.sendMessage}/>
          </div>
        </div>
      </div>
    );
  }
}
