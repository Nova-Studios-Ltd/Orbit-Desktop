import React from 'react';
import { Button, IconButton, TextField, Typography } from '@mui/material/';
//import { Send } from '@mui/icons-material';
import MessageCanvas from './MessageCanvas';

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

  setValue(text: string) {
    this.setState({message: text});
  }

  render() {
    return (
      <TextField className="Chat_MessageInput" value={this.state.message} onChange={this.handleChange} onKeyDown={this.handleKeyDown} />
    );
  }
}

export default function Chat() {
  return (
    <div className="Chat_Page_Container">
      <Typography className="" variant="h3">Chat</Typography>
      <MessageCanvas />
      <div className="Chat_Page_Bottom">
        <MessageInput />
        {/* <IconButton className="Chat_SendButton"><Send /></IconButton> */}
      </div>
    </div>
  );
}
