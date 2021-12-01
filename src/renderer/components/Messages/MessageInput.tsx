import React from 'react';
import { Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material/';
import { Send as SendIcon, Logout as LogoutIcon, Upload as UploadIcon } from '@mui/icons-material';
import type { IMessageInputProps, IMessageInputState } from 'types/interfaces';
import AppNotification from 'renderer/components/Notification/Notification';
import { NotificationStatusType } from 'types/enums';
import GLOBALS from 'shared/globals';
import { ipcRenderer } from 'shared/helpers';

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
    ipcRenderer.send('uploadFile');
  }

  setMessageTo(text: string) {
    this.setState({message: text});
  }

  render() {
    const availableCharacterRemainder = GLOBALS.MessageCharacterLimit - this.state.message.length;
    const showMaxLength = availableCharacterRemainder > GLOBALS.MessageCharacterLimit * 0.15 ? 'Hidden' : '';

    return (
      <div className='Chat_Page_Bottom'>
        <IconButton className='Chat_IconButton' onClick={this.handleUploadButtonClick}><UploadIcon /></IconButton>
        <TextField className='MessageInput' placeholder='Type your message here...' value={this.state.message} autoFocus onChange={this.handleChange} onKeyDown={this.handleKeyDown} inputProps={{
          maxLength: GLOBALS.MessageCharacterLimit,
        }}
        // eslint-disable-next-line react/jsx-no-duplicate-props
        InputProps={{
          endAdornment: (
            <InputAdornment className={showMaxLength} position='end'>
              {availableCharacterRemainder}
            </InputAdornment>
          )
        }} />
        <IconButton className='Chat_IconButton' onClick={this.handleSendButtonClick}><SendIcon/></IconButton>
      </div>
    );
  }
}
