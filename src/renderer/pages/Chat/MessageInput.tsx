import React from 'react';
import { Button, IconButton, TextField, Typography } from '@mui/material/';
import { Send, Logout as LogoutIcon } from '@mui/icons-material';

export default class MessageInput extends React.Component {
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
      <div className="Chat_Page_Bottom">
          <TextField className="Chat_MessageInput" placeholder="Type your message here..." value={this.state.message} onChange={this.handleChange} onKeyDown={this.handleKeyDown} />
          <IconButton className="Chat_IconButton" onClick={this.handleClick}><Send/></IconButton>
      </div>
    );
  }
}
