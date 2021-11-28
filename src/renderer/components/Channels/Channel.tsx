import React, { DOMElement, ForwardedRef, RefObject } from 'react';
import { Card, Typography, Avatar, CardMedia, Menu, MenuItem, ButtonBase } from '@mui/material';
import GLOBALS from 'shared/globals'
import { ipcRenderer, LoadMessageFeed, setDefaultChannel } from 'shared/helpers';
import { IChannelProps, IChannelState } from 'types/interfaces';
import AppNotification from 'renderer/components/Notification/Notification';
import YesNoDialog from '../Dialogs/YesNoDialog';

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
    this.removeUserFromThisChannel = this.removeUserFromThisChannel.bind(this);
    this.closeChannelDeletionDialog = this.closeChannelDeletionDialog.bind(this);

    this.state = {
      contextMenuAnchorEl: null,
      contextMenuOpen: false,
      confirmChannelDeletionDialogOpen: false
    }
  }

  channelRightClicked(event: React.ReactElement<any, string | React.JSXElementConstructor<any>>) {
    this.setState({ contextMenuOpen: !this.state.contextMenuOpen, contextMenuAnchorEl: event.currentTarget });
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
        new AppNotification({title: 'Edit'}).show();
        break;
      case 'delete':
        this.setState({ confirmChannelDeletionDialogOpen: true });
        break;
    }

    this.closeContextMenu();
  }

  closeContextMenu() {
    this.setState({ contextMenuOpen: false, contextMenuAnchorEl: null });
  }

  closeChannelDeletionDialog() {
    this.setState({ confirmChannelDeletionDialogOpen: false });
  }

  removeUserFromThisChannel() {
    ipcRenderer.send('removeSelfFromChannel', { channelID: this.channelID, userID: GLOBALS.userData.uuid });
    this.closeChannelDeletionDialog();
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
          anchorEl={this.state.contextMenuAnchorEl}
          open={this.state.contextMenuOpen}
          onClose={this.closeContextMenu}
          >

          <MenuItem id='edit' onClick={this.menuItemClicked}>Edit</MenuItem>
          <MenuItem id='delete' onClick={this.menuItemClicked}>Delete</MenuItem>
        </Menu>
        <YesNoDialog title='Confirm Leave Channel'
          body='You will no longer have access to this channel unless you are reinvited. If you are the last person in this channel, it will be permanently lost forever!'
          confirmButtonText='Leave'
          denyButtonText='Cancel'
          onConfirm={this.removeUserFromThisChannel}
          onDeny={this.closeChannelDeletionDialog}
          show={this.state.confirmChannelDeletionDialogOpen}
        ></YesNoDialog>
      </div>
    );
  }
}
