import { Avatar, Typography } from '@mui/material';
import React from 'react';

export default class Message extends React.Component {
  uuid: string;
  senderName: string;
  message: string;
  avatarSrc: string;

  constructor(props: any) {
    super(props);
    this.uuid = props.uuid;
    this.senderName = props.senderName || "{Unknown}";
    this.message = props.message || "[Message]";
    this.avatarSrc = props.avatarSrc;
  }

  render() {
    return (
      <div className="Chat_Message">
        <div className="Chat_Message_Left">
          <Avatar src={this.avatarSrc} />
        </div>
        <div className="Chat_Message_Right">
          <Typography>{this.senderName}</Typography>
          <Typography>{this.message}</Typography>
        </div>
      </div>
    );
  }
}
