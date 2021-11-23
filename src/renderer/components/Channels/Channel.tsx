import React, { DOMElement, ForwardedRef, RefObject } from 'react';
import { Card, Typography, Avatar, CardMedia, Menu, MenuItem, ButtonBase } from '@mui/material';
import GLOBALS from 'shared/globals'
import { ipcRenderer, LoadMessageFeed, setDefaultChannel } from 'shared/helpers';
import { IChannelProps, IChannelState } from 'types/interfaces';

export default class Channel extends React.Component {
  state: IChannelState;
  channelName: string;
  channelID: string;
  channelIcon?: string;

  constructor(props: IChannelProps) {
    super(props);
    this.channelName = props.channelName;
    this.channelID = props.table_Id;
    this.channelIcon = props.channelIcon;

    this.channelClicked = this.channelClicked.bind(this);
    this.channelRightClicked = this.channelRightClicked.bind(this);
    this.menuItemClicked = this.menuItemClicked.bind(this);
    this.closeContextMenu = this.closeContextMenu.bind(this);

    this.state = {
      anchorEl: null,
      open: false
    }
  }

  channelRightClicked(event: React.ReactElement<any, string | React.JSXElementConstructor<any>>) {
    this.setState({ open: !this.state.open, anchorEl: event.currentTarget });
  }

  channelClicked() {
    console.warn("WORKS!");
    GLOBALS.currentChannel = this.channelID;
    setDefaultChannel(this.channelID);
    ipcRenderer.send('requestChannelData', GLOBALS.currentChannel);
  }

  async menuItemClicked(event: React.ReactElement<any, string | React.JSXElementConstructor<any>>) {
    switch(event.currentTarget.id) {
      case 'edit':
        console.warn("EDIT");
        break;
      case 'delete':
        console.warn("DELETE");
        break;
    }

    this.closeContextMenu();
  }

  closeContextMenu() {
    this.setState({ open: false, anchorEl: null });
  }

  render() {
    return(
      <div className='Chat_Channel'>
        <Card className='Chat_Channel_Inner'>
          <ButtonBase className='Chat_Channel_Inner' onClick={this.channelClicked} onContextMenu={this.channelRightClicked}>
            <div className='Channel_Left'>
              <Avatar className='Channel_Icon' src={this.channelIcon} />
            </div>
            <div className='Channel_Right'>
              <Typography className='Channel_Caption' variant='h6'>{this.channelName}</Typography>
            </div>
          </ButtonBase>
        </Card>
        <Menu
          id='channel-dropdown-menu'
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onClose={this.closeContextMenu}
          >

          <MenuItem id='edit' onClick={this.menuItemClicked}>Edit</MenuItem>
          <MenuItem id='delete' onClick={this.menuItemClicked}>Delete</MenuItem>
        </Menu>
      </div>
    );
  }
}
