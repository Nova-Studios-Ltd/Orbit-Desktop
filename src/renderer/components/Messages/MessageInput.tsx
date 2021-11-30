import React from 'react';
import { Button, IconButton, TextField, Typography } from '@mui/material/';
import { Send as SendIcon, Logout as LogoutIcon, Upload as UploadIcon } from '@mui/icons-material';
import type { IMessageInputProps, IMessageInputState } from 'types/interfaces';
import AppNotification from '../Notification/Notification';
import { NotificationStatusType } from 'types/enums';

export default class MessageInput extends React.Component {
  state: IMessageInputState;
  forwardMessageCallback: Function;

  constructor(props: IMessageInputProps) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSendButtonClick = this.handleSendButtonClick.bind(this);
    this.handleUploadButtonClick = this.handleUploadButtonClick.bind(this);
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

  handleSendButtonClick(event: any) {
    this.forwardMessage(this.state.message);
    this.setMessageTo('');
  }

  handleUploadButtonClick(event: any) {
    new AppNotification({title: 'Not Implemented', body: 'Upload Button Clicked', notificationType: NotificationStatusType.warning}).show();
  }

  setMessageTo(text: string) {
    this.setState({message: text});
  }

  render() {
    return (
      <div className='Chat_Page_Bottom'>
        <IconButton className='Chat_IconButton' onClick={this.handleUploadButtonClick}><UploadIcon /></IconButton>
        <TextField className='MessageInput' placeholder='Type your message here...' value={this.state.message} autoFocus onChange={this.handleChange} onKeyDown={this.handleKeyDown} />
        <IconButton className='Chat_IconButton' onClick={this.handleSendButtonClick}><SendIcon/></IconButton>
      </div>
    );
  }
}
