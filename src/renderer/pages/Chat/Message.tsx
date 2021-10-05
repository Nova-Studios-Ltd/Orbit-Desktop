import { Avatar, Typography } from '@mui/material';
import React from 'react';

export default class Message extends React.Component {
  uuid: string;
  username: string;
  message: string;
  avatarSrc: string;

  constructor(props: any) {
    super(props);
    this.uuid = props.uuid;
    this.username = props.author || "Unknown";
    this.message = props.content || "Message";
    this.avatarSrc = props.avatarSrc;
  }

  render() {
    return (
      <div className="Chat_Message">
        <div className="Chat_Message_Left">
          <Avatar src={this.avatarSrc} />
        </div>
        <div className="Chat_Message_Right">
          <Typography className="Chat_Message_Name" fontWeight="bold">{this.username}</Typography>
          <Typography className="Chat_Message_Content">{this.message}</Typography>
        </div>
      </div>
    );
  }
}
