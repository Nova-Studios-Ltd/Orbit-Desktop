import React from 'react';
import { Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material/';
import { Send as SendIcon, Logout as LogoutIcon, Upload as UploadIcon } from '@mui/icons-material';
import type { IMessageInputProps, IMessageInputState } from 'types/interfaces';
import AppNotification from 'renderer/components/Notification/Notification';
import { LogContext, NotificationStatusType } from 'types/enums';
import GLOBALS from 'shared/globals';
import { Debug, ipcRenderer } from 'shared/helpers';
import MessageAttachment from 'structs/MessageAttachment';

export default class MessageInput extends React.Component {
  state: IMessageInputState;
  forwardMessageCallback: (message: string, attachments: MessageAttachment[]) => void;
  ctrlPressed: boolean;

  constructor(props: IMessageInputProps) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSendButtonClick = this.handleSendButtonClick.bind(this);
    this.handleUploadButtonClick = this.handleUploadButtonClick.bind(this);
    this.forwardMessage = this.forwardMessage.bind(this);
    this.addedAttachment = this.addedAttachment.bind(this);

    this.forwardMessageCallback = props.onMessagePush;
    this.ctrlPressed = false;

    ipcRenderer.on('pickedUploadFiles', this.addedAttachment);

    this.state = { message: '', attachments: []}
  }

  addedAttachment(files: string[]) {
    files.forEach((file) => this.state.attachments.push(new MessageAttachment(file, false)));
    this.setState({attachments: this.state.attachments});
  }

  forwardMessage(message: string, attachments: MessageAttachment[]) {
    if (this.forwardMessageCallback != null) {
      this.forwardMessageCallback(message, attachments);
    }
    else {
      Debug.Error('forwardMessageCallback is null', LogContext.Renderer, 'when forwarding message to ChatPage from Messageinput');
    }
  }

  handleChange(event: any) {
    this.setMessageTo(event.target.value);
  }

  async handleKeyDown(event: any) {
    if (event.keyCode == 13) {
      this.forwardMessage(this.state.message, this.state.attachments);
      this.setMessageTo('', []);
    }
    if (event.keyCode == 17 || event.keyCode == 91) {
      this.ctrlPressed = true;
      console.log(this.ctrlPressed);
    }
    if (event.keyCode == 86 && this.ctrlPressed && false) {
      const a = new MessageAttachment(await ipcRenderer.invoke('copyImageFromClipboard'), true);
      if (a.contents == '') return;
      this.state.attachments.push(a);
      this.setState({attachments: this.state.attachments});
      console.log(this.state.attachments);
    }
  }

  handleKeyUp(event: any) {
    if (event.keyCode == 17 || event.keyCode == 91) {
      this.ctrlPressed = false;
      console.log(this.ctrlPressed);
    }
  }
  
  handleSendButtonClick(event: any) {
    this.forwardMessage(this.state.message, this.state.attachments);
    this.setMessageTo('', []);
  }

  handleUploadButtonClick(event: any) {
    ipcRenderer.send('pickUploadFiles');
  }

  setMessageTo(text: string, attachment?: string[]) {
    if (attachment == undefined)
      this.setState({message: text});
    else
      this.setState({message: text, attachments: attachment});
  }

  render() {
    const availableCharacterRemainder = GLOBALS.MessageCharacterLimit - this.state.message.length;
    const showMaxLength = availableCharacterRemainder > GLOBALS.MessageCharacterLimit * 0.15 ? 'Hidden' : '';

    return (
      <div className='Chat_Page_Bottom'>
        <IconButton className='Chat_IconButton' onClick={this.handleUploadButtonClick}><UploadIcon /></IconButton>
        <TextField className='MessageInput' placeholder='Type your message here...' value={this.state.message} autoFocus onChange={this.handleChange} onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp} inputProps={{
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
