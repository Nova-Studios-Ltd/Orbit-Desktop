import React from 'react';
import { Button, IconButton, TextField, Typography } from '@mui/material/';
import { Send as SendIcon, Logout as LogoutIcon } from '@mui/icons-material';
import type { IMessageInputProps, IMessageInputState } from 'types/interfaces';

export default class MessageInput extends React.Component {
  state: IMessageInputState;
  forwardMessageCallback: Function;

  constructor(props: IMessageInputProps) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.forwardMessage = this.forwardMessage.bind(this);

    this.forwardMessageCallback = props.onMessagePush;

    this.state = { message: '' }
  }

  forwardMessage(message: string) {
    if (this.forwardMessageCallback != null) {
      this.forwardMessageCallback(message);
    }
    else {
      console.error('forwardMessageCallback is null');
    }
  }

  handleChange(event: any) {
    this.setMessageTo(event.target.value);
  }

  handleKeyDown(event: any) {
    if (event.keyCode === 13) {
      this.forwardMessage(this.state.message);
      this.setMessageTo('');
    }
  }

  handleClick(event: any) {
    this.forwardMessage(this.state.message);
    this.setMessageTo('');
  }

  setMessageTo(text: string) {
    this.setState({message: text});
  }

  render() {
    return (
      <div className='Chat_Page_Bottom'>
          <TextField className='MessageInput' placeholder='Type your message here...' value={this.state.message} onChange={this.handleChange} onKeyDown={this.handleKeyDown} />
          <IconButton className='Chat_IconButton' onClick={this.handleClick}><SendIcon/></IconButton>
      </div>
    );
  }
}
