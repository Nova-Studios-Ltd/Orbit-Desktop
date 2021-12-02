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
    this.addedAttachment = this.addedAttachment.bind(this);

    this.forwardMessageCallback = props.onMessagePush;

    ipcRenderer.on('pickedUploadFiles', this.addedAttachment);

    this.state = { message: '', attachments: []}
  }

  addedAttachment(files: string[]) {
    files.forEach((file) => this.state.attachments.push(file));
    console.log(this.state.attachments);
    this.setState({attachments: this.state.attachments});
  }

  forwardMessage(message: string, attachments: string[]) {
    if (this.forwardMessageCallback != null) {
      this.forwardMessageCallback(message, attachments);
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
      this.forwardMessage(this.state.message, this.state.attachments);
      this.setMessageTo('');
    }
  }

  handleSendButtonClick(event: any) {
    this.forwardMessage(this.state.message, this.state.attachments);
    this.setMessageTo('');
  }

  handleUploadButtonClick(event: any) {
    ipcRenderer.send('pickUploadFiles');
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
