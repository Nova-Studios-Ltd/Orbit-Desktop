import React, { RefObject } from 'react';
import { Card, Typography, Avatar, CardMedia } from '@mui/material';
import GLOBALS from 'renderer/globals'
import { ipcRenderer, LoadMessageFeed, setDefaultChannel } from 'renderer/helpers';
import { IChannelProps } from 'renderer/interfaces';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';

export default class Channel extends React.Component {
  channelName: string;
  channelID: string;
  channelIcon?: string;
  rippleRef: RefObject;

  constructor(props: IChannelProps) {
    super(props);
    this.channelName = props.channelName;
    this.channelID = props.channelID;
    this.channelIcon = props.channelIcon;

    this.rippleRef = React.createRef();

    this.channelClicked = this.channelClicked.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  channelClicked() {
    GLOBALS.currentChannel = this.channelID;
    setDefaultChannel(this.channelID);
    console.log(`Selected Channel: ${GLOBALS.currentChannel}`);
    ipcRenderer.send('requestChannelData', GLOBALS.currentChannel);
  }

  onMouseDown(event: React.MouseEvent<HTMLDivElement> ) {
    if (this.rippleRef != null && this.rippleRef.current != null) {
      this.rippleRef.current.start(event);
    }
  }

  onMouseUp(event: React.MouseEvent<HTMLDivElement> ) {
    if (this.rippleRef != null && this.rippleRef.current != null) {
      this.rippleRef.current.stop(event);
    }
  }

  render() {
    return(
      <Card className='Chat_Channel' onClick={this.channelClicked} onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp}>
        <TouchRipple ref={this.rippleRef}/>
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
