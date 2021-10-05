import { Avatar, Typography } from '@mui/material';
import React from 'react';

// <Message content="Message" author="User" uuid={internalShit} avatarSrc="URL to user's avatar" />

export default class Message extends React.Component {
  uuid: string;
  author: string;
  message: string;
  avatarSrc: string;

  constructor(props: any) {
    super(props);
    this.uuid = props.uuid;
    this.author = props.author || "Unknown";
    this.message = props.message || "Message";
    this.avatarSrc = props.avatarSrc;
  }

  render() {
    return (
      <div className="Chat_Message">
        <div className="Chat_Message_Left">
          <Avatar src={this.avatarSrc} />
        </div>
        <div className="Chat_Message_Right">
          <Typography className="Chat_Message_Name" fontWeight="bold">{this.author}</Typography>
          <Typography className="Chat_Message_Content">{this.message}</Typography>
        </div>
      </div>
    );
  }
}
