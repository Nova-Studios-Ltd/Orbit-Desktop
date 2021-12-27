import React from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material/';
import { Send as SendIcon, Upload as UploadIcon } from '@mui/icons-material';
import { LogContext } from 'types/enums';
import { Debug, ipcRenderer } from 'shared/helpers';
import MessageAttachment from 'structs/MessageAttachment';
import { Settings } from 'shared/SettingsManager';
import FormTextField from '../Form/FormTextField';

interface IMessageInputProps {
  onAddAttachment: (attachment: MessageAttachment) => void,
  onMessagePush: (message: string) => void
}

interface IMessageInputState {
  message: string
}

export default class MessageInput extends React.Component<IMessageInputProps> {
  state: IMessageInputState;

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

  handleChange(event: React.FormEvent<HTMLInputElement>) {
    this.setMessageTo(event.target.value);
  }

  async handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.code == 'Enter') {
      this.forwardMessage(this.state.message);
      this.setMessageTo('', []);
    }
  }

  handleKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {

  }

  handleSendButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    this.forwardMessage(this.state.message);
    this.setMessageTo('');
  }

  handleUploadButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    ipcRenderer.send('pickUploadFiles');
  }

  setMessageTo(text: string) {
    this.setState({ message: text });
  }

  render() {
    const availableCharacterRemainder = Settings.Settings.MessageCharacterLimit - this.state.message.length;
    const showMaxLength = availableCharacterRemainder > Settings.Settings.MessageCharacterLimit * 0.15 ? 'Hidden' : '';

    return (
      <div className='Chat_Page_Bottom'>
        <IconButton className='Chat_IconButton' onClick={this.handleUploadButtonClick}><UploadIcon /></IconButton>
        <TextField className='MessageInput' placeholder='Type your message here...' value={this.state.message} autoFocus onChange={this.handleChange} onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp} inputProps={{
          maxLength: Settings.Settings.MessageCharacterLimit,
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
