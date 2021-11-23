import React, { DOMElement, RefObject } from 'react';
import { Card, Typography, Avatar, CardMedia, Menu, MenuItem } from '@mui/material';
import GLOBALS from 'shared/globals'
import { ipcRenderer, LoadMessageFeed, setDefaultChannel } from 'shared/helpers';
import { IChannelProps } from 'types/interfaces';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';

export default class Channel extends React.Component {
  channelName: string;
  channelID: string;
  channelIcon?: string;
  rippleRef: RefObject<ReactDOM>;

  constructor(props: IChannelProps) {
    super(props);
    this.channelName = props.channelName;
    this.channelID = props.table_Id;
    this.channelIcon = props.channelIcon;

    this.rippleRef = React.createRef();

    this.channelClicked = this.channelClicked.bind(this);
    this.channelRightClicked = this.channelRightClicked.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  channelRightClicked(event: React.ReactElement<any, string | React.JSXElementConstructor<any>>) {
    if (this.props.clickedCallback != null) this.props.clickedCallback(event, this.channelID);
  }

  channelClicked() {
    GLOBALS.currentChannel = this.channelID;
    setDefaultChannel(this.channelID);
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
      <Card className='Chat_Channel' onClick={this.channelClicked} onContextMenu={this.channelRightClicked} onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp}>
        <TouchRipple ref={this.rippleRef}/>
        <div className='Channel_Left'>
          <Avatar className='Channel_Icon' src={this.channelIcon} />
        </div>
        <div className='Channel_Right'>
          <Typography className='Channel_Caption' variant='h6'>{this.channelName}</Typography>
        </div>
        <Menu
          id='channel-dropdown-menu'
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onClose={this.closeContextMenu}
          >

          <MenuItem id='edit' onClick={this.menuItemClicked}>Edit</MenuItem>
          <MenuItem id='delete' onClick={this.menuItemClicked}>Delete</MenuItem>
        </Menu>
      </Card>
    );
  }
}
