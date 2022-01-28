import React, { KeyboardEvent, ChangeEvent } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material/';
import { Send as SendIcon, Upload as UploadIcon } from '@mui/icons-material';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';
import { Debug, ipcRenderer , Manager } from 'renderer/helpers';
import MessageAttachment from 'structs/MessageAttachment';
import AppNotification from '../Notification/Notification';

interface IMessageInputProps {
  onAddAttachment: (attachment: MessageAttachment) => void,
  onMessagePush: (message: string) => void
}

interface IMessageInputState {
  message: string
}

export default class MessageInput extends React.Component<IMessageInputProps> {
  state: IMessageInputState;
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
    this.messageSent = this.messageSent.bind(this);

    ipcRenderer.on('pickedUploadFiles', this.addedAttachment);
    ipcRenderer.on('MessageSent', this.messageSent);

    this.ctrlPressed = false;

    this.state = { message: '' };
  }

  messageSent(result: boolean) {
    if (result) this.setMessageTo('');
    else {
      // TODO Make this do something to the input box
      new AppNotification({ title: 'Message Sent', body: 'Message failed to sent for a unknown reason, try sending the message again. If it fails restart the app and check your internet connection', playSound: false, notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
    }
  }

  addedAttachment(files: string[]) {
    if (this.props != null && this.props.onAddAttachment != null)
      files.forEach((file) => this.props.onAddAttachment(new MessageAttachment(file, false)));
  }

  forwardMessage(message: string) {
    if (this.props.onMessagePush != null) {
      this.props.onMessagePush(message);
    }
    else {
      Debug.Error('forwardMessageCallback is null', 'when forwarding message to ChatPage from Messageinput');
    }
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    this.setMessageTo(event.currentTarget.value);
  }

  async handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.code == 'Enter') {
      this.forwardMessage(this.state.message);
      //this.setMessageTo('');
    }
    if (event.keyCode == 17 || event.keyCode == 91) {
      this.ctrlPressed = true;
    }
    if (event.keyCode == 86 && this.ctrlPressed) {
      const a = new MessageAttachment(await ipcRenderer.invoke('copyImageFromClipboard'), true);
      if (a.contents == '') return;
      this.props.onAddAttachment(a);
    }
  }

  handleKeyUp(event: KeyboardEvent<HTMLDivElement>) {
    if (event.keyCode == 17 || event.keyCode == 91) {
      this.ctrlPressed = false;
    }
  }

  handleSendButtonClick() {
    this.forwardMessage(this.state.message);
    //this.setMessageTo('');
  }

  handleUploadButtonClick() {
    ipcRenderer.send('pickUploadFiles');
  }

  setMessageTo(text: string) {
    this.setState({ message: text });
  }

  render() {
    const availableCharacterRemainder = Manager.MessageCharacterLimit - this.state.message.length;
    const showMaxLength = availableCharacterRemainder > Manager.MessageCharacterLimit * 0.15 ? 'Hidden' : '';

    return (
      <div className='Chat_Page_Bottom'>
        <IconButton className='Chat_IconButton' onClick={this.handleUploadButtonClick}><UploadIcon /></IconButton>
        <TextField className='MessageInput' placeholder='Type your message here...' value={this.state.message} autoFocus onChange={this.handleChange} onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp} inputProps={{
          maxLength: Manager.MessageCharacterLimit,
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
