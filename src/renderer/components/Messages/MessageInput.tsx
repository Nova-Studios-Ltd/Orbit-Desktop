import React, { KeyboardEvent, ChangeEvent } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material/';
import { Send as SendIcon, Upload as UploadIcon } from '@mui/icons-material';
import { LogContext } from 'types/enums';
import { Debug, ipcRenderer } from 'shared/helpers';
import MessageAttachment from 'structs/MessageAttachment';
import { SettingsManager } from 'shared/SettingsManager';

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

    ipcRenderer.on('pickedUploadFiles', this.addedAttachment);

    this.ctrlPressed = false;

    this.state = { message: '' };
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
      Debug.Error('forwardMessageCallback is null', LogContext.Renderer, 'when forwarding message to ChatPage from Messageinput');
    }
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    this.setMessageTo(event.currentTarget.value);
  }

  async handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.code == 'Enter') {
      this.forwardMessage(this.state.message);
      this.setMessageTo('');
    }
    if (event.keyCode == 17 || event.keyCode == 91) {
      this.ctrlPressed = true;
    }
    /*if (event.keyCode == 86 && this.ctrlPressed && false) {
      const a = new MessageAttachment(await ipcRenderer.invoke('copyImageFromClipboard'), true);
      if (a.contents == '') return;
      this.state.attachments.push(a);
      this.setState({attachments: this.state.attachments});
      console.log(this.state.attachments);
    }*/
  }

  handleKeyUp(event: KeyboardEvent<HTMLDivElement>) {
    if (event.keyCode == 17 || event.keyCode == 91) {
      this.ctrlPressed = false;
    }
  }

  handleSendButtonClick() {
    this.forwardMessage(this.state.message);
    this.setMessageTo('');
  }

  handleUploadButtonClick() {
    ipcRenderer.send('pickUploadFiles');
  }

  setMessageTo(text: string) {
    this.setState({ message: text });
  }

  render() {
    const availableCharacterRemainder = SettingsManager.Settings.MessageCharacterLimit - this.state.message.length;
    const showMaxLength = availableCharacterRemainder > SettingsManager.Settings.MessageCharacterLimit * 0.15 ? 'Hidden' : '';

    return (
      <div className='Chat_Page_Bottom'>
        <IconButton className='Chat_IconButton' onClick={this.handleUploadButtonClick}><UploadIcon /></IconButton>
        <TextField className='MessageInput' placeholder='Type your message here...' value={this.state.message} autoFocus onChange={this.handleChange} onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp} inputProps={{
          maxLength: SettingsManager.Settings.MessageCharacterLimit,
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
