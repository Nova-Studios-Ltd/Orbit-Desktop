import React, { createRef, DOMElement, Ref, RefObject } from 'react';
import { ReactHeight } from 'react-height';
import { Button, IconButton, TextField, Typography } from '@mui/material/';
import { Send, Logout as LogoutIcon, MessageSharp } from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import Message from './Message';
import MessageCanvas from './MessageCanvas';
import { Logout, LoadMessageFeed, ipcRenderer, Navigate } from '../../helpers';

class MessageInput extends React.Component {
  forwardMessageCallback: Function;

  constructor(props: any) {
    super(props);
    this.state = {message: "", bottom_height: 0};

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.forwardMessage = this.forwardMessage.bind(this);

    this.forwardMessageCallback = props.onMessagePush;
  }

  forwardMessage(message: string) {
    if (this.forwardMessageCallback != null) {
      this.forwardMessageCallback(message);
    }
    else {
      console.error("forwardMessageCallback is null");
    }
  }

  handleChange(event: any) {
    this.setMessageTo(event.target.value);
  }

  handleKeyDown(event: any) {
    if (event.keyCode === 13) {
      this.forwardMessage(this.state.message);
      this.setMessageTo("");
    }
  }

  handleClick(event: any) {
    this.forwardMessage(this.state.message);
    this.setMessageTo("");
  }

  setMessageTo(text: string) {
    this.setState({message: text});
  }

  render() {
    return (
      <div style={{height: "188px"}}>
          <div className="Chat_Page_Bottom">
              <TextField className="Chat_MessageInput" value={this.state.message} onChange={this.handleChange} onKeyDown={this.handleKeyDown} />
              <IconButton className="Chat_IconButton" onClick={this.handleClick}><Send /></IconButton>
        </div>
      </div>
    );
  }
}

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
      ipcRenderer.on('receivedChannelData', (data: string) => { this.onReceivedChannelData(LoadMessageFeed(data))} );
      ipcRenderer.on('receivedChannelUpdate', (data: string) => { this.onReceivedChannelData([JSON.parse(data)]); });
    }
    else {
      console.error("Message canvas initialization error.")
    }
  }

  appendToCanvas(message: JSON) {
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      const msgObj = new Message({ message: message.content, author: message.author, avatarSrc: `https://api.novastudios.tk/Media/Avatar/${message.author_UUID}?size=64` });
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
        <div className="Chat_Page_Header">
          <IconButton className="Chat_IconButton" onClick={Logout}><LogoutIcon /></IconButton>
          <Typography variant="h5">Chat</Typography>
        </div>
        <div className="Chat_Page_Body">
          <MessageCanvas init={this.init}/>
          <MessageInput onMessagePush={this.sendMessage}/>
        </div>
      </div>
    );
  }
}
