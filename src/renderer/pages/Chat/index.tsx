import React, { RefObject } from 'react';
import { Button, IconButton, TextField, Typography } from '@mui/material/';
import { Send, Logout as LogoutIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import Message from './Message';
import MessageCanvas from './MessageCanvas';
import { Navigate, ipcRenderer } from '../../helpers';

class MessageInput extends React.Component {
  MessageInputObject: RefObject<MessageInput>;

  constructor(props: any) {
    super(props);
    this.state = {message: ""};
    this.MessageInputObject = React.createRef().current;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: any) {
    this.setValue(event.target.value);
  }

  handleKeyDown(event: any) {
    if (event.keyCode === 13) {
      console.log(`Message Sent: ${this.state.message}`);
      ipcRenderer.send('sendMessageToServer', 'b1642a0175554994b3f593f191c610b5', this.state.message);
      this.setValue("");
    }
  }

  handleClick(event: any) {
    console.log(`Message Sent: ${this.state.message}`);
    ipcRenderer.send('sendMessageToServer', 'b1642a0175554994b3f593f191c610b5', this.state.message);
    this.MessageInputObject.setValue("");
  }

  setValue(text: string) {
    this.setState({message: text});
  }

  render() {
    return (
      <div className="Chat_Page_Bottom">
        <TextField className="Chat_MessageInput" ref={this.MessageInputObject} value={this.state.message} onChange={this.handleChange} onKeyDown={this.handleKeyDown} />
        <IconButton className="Chat_IconButton" onClick={this.handleClick}><Send /></IconButton>
      </div>
    );
  }
}

let CanvasObject = React.createRef().current;

function Logout() {
  Navigate("/login");
}

export function LoadMessageFeed(channelData: string) {
  const messages = JSON.parse(channelData);
  console.log(messages);
}

export default function Chat() {
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
        <MessageCanvas ref={CanvasObject}/>
        <MessageInput />
      </div>
    </div>
  );
}
