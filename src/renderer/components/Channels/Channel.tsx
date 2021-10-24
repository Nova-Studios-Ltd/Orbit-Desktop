import React from 'react';
import { Card, Typography, Avatar, CardMedia } from '@mui/material';
import GLOBALS from 'renderer/globals'
import { ipcRenderer, LoadMessageFeed, setDefaultChannel } from 'renderer/helpers';
import { IChannelProps } from 'renderer/interfaces';

export default class Channel extends React.Component {
  channelName: string;
  channelID: string;
  channelIcon?: string;

  constructor(props: IChannelProps) {
    super(props);
    this.channelName = props.channelName;
    this.channelID = props.channelID;
    this.channelIcon = props.channelIcon;

    this.channelClicked = this.channelClicked.bind(this);
  }

  channelClicked() {
    GLOBALS.currentChannel = this.channelID;
    setDefaultChannel(this.channelID);
    console.log(`Selected Channel: ${GLOBALS.currentChannel}`);
    ipcRenderer.send('requestChannelData', GLOBALS.currentChannel);
  }

  render() {
    return(
      <Card className='Chat_Channel' onClick={this.channelClicked}>
        <div className='Channel_Left'>
          <Avatar className='Channel_Icon' src={this.channelIcon} />
        </div>
        <div className='Channel_Right'>
          <Typography className='Channel_Caption' variant='h6'>{this.channelName}</Typography>
        </div>
      </Card>
    );
  }
}
