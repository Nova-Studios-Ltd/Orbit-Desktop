import React from 'react';
import { Button, IconButton, TextField, Typography } from '@mui/material/';
import { Send, Logout as LogoutIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import MessageCanvas from './MessageCanvas';
import { Navigate } from '../../helpers';

class MessageInput extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {message: ""};
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: any) {
    this.setValue(event.target.value);
  }

  handleKeyDown(event: any) {
    if (event.keyCode === 13) {
      console.log(`Message Sent: ${this.state.message}`);
      this.setValue("");
    }
  }

  handleClick(event: any) {

  }

  setValue(text: string) {
    this.setState({message: text});
  }

  render() {
    return (
      <div className="Chat_Page_Bottom">
        <TextField className="Chat_MessageInput" value={this.state.message} onChange={this.handleChange} onKeyDown={this.handleKeyDown} />
        <IconButton className="Chat_IconButton" onClick={this.handleClick}><Send /></IconButton>
      </div>
    );
  }
}

function Logout() {
  Navigate("/login");
}

export function LoadMessageFeed(channelData: string) {
  const messages = JSON.parse(channelData);
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
      <MessageCanvas />
      <MessageInput />
    </div>
  );
}
