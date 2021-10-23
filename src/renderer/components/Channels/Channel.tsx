import React from 'react';
import { Card, Typography, Avatar } from '@mui/material';
import GLOBALS from 'renderer/Globals'
import { ipcRenderer } from 'renderer/helpers';
import { IChannelProps } from 'renderer/interfaces';

export default class Channel extends React.Component {
  channelName: string;
  channelID: string;

  constructor(props: IChannelProps) {
    super(props);
    this.channelName = props.channelName;
    this.channelID = props.channelID;

    this.channelClicked = this.channelClicked.bind(this);
  }

  channelClicked() {
    GLOBALS.currentChannel = this.channelID;
    console.log(`Selected Channel: ${GLOBALS.currentChannel}`);
    ipcRenderer.send('requestChannelData', GLOBALS.currentChannel);
  }

  render() {
    return(
      <Card className="Chat_Page_Channel" onClick={this.channelClicked}>
        <Typography className="Chat_Channel_Caption" variant="subtitle1">{this.channelName}</Typography>
        <Typography className="Chat_Channel_Message_Preview" variant="body1" fontWeight="light">Latest message should show up here</Typography>
      </Card>
    );
  }
}
