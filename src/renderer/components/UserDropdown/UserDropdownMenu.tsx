import React from 'react';
import { Avatar, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import type { IUserDropdownMenu, IUserDropdownMenuFunctions, IUserDropdownMenuState } from 'types/interfaces';
import UserData from 'structs/UserData';
import { copyToClipboard, Navigate } from 'shared/helpers';
import AppNotification from 'renderer/components/Notification/Notification';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';

export default class UserDropdownMenu extends React.Component {
  state: IUserDropdownMenuState;
  menuFunctions: IUserDropdownMenuFunctions;
  userData: UserData;

  constructor(props: IUserDropdownMenu) {
    super(props);
    this.menuFunctions = props.menuFunctions;
    this.userData = props.userData;
    this.state = {
      anchorEl: null,
      open: false
    }

    this.handleClose = this.handleClose.bind(this);
    this.buttonClicked = this.buttonClicked.bind(this);
    this.menuItemClicked = this.menuItemClicked.bind(this);
  }

  buttonClicked(event) {
    this.setState({ open: !this.state.open, anchorEl: event.currentTarget });
  }

  async menuItemClicked(event: React.ReactElement<any, string | React.JSXElementConstructor<any>>) {
    switch(event.currentTarget.id) {
      case 'userinfo':
        await copyToClipboard(this.userData.uuid).then((result: boolean) => {
          if (result) {
            new AppNotification({ body: 'Copied UUID to clipboard', notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
          }
        });
        break;
      case 'settings':
        Navigate('/settings', null);
        break;
      case 'logout':
        this.menuFunctions.logout();
        break;
    }

    this.setState({ open: false, anchorEl: null });
  }

  handleClose(event) {
    this.setState({ open: false, anchorEl: null });
  }

  render() {
    return(
      <div>
        <IconButton onClick={this.buttonClicked}>
          <Avatar src={`https://api.novastudios.tk/Media/Avatar/${this.userData.uuid}?size=64`} />
        </IconButton>

        <Menu
          id='userdropdown-menu'
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onClose={this.handleClose}
          MenuListProps={{
            'aria-labelledby': 'userdropdown-menu',
          }}
        >

        <MenuItem id='userinfo' onClick={(event) => this.menuItemClicked(event)}>
        <Typography variant='subtitle1'>{this.userData.username}<Typography variant='caption'>#{this.userData.discriminator}</Typography></Typography>
        </MenuItem>
        <MenuItem id='settings' onClick={(event) => this.menuItemClicked(event)}>Settings</MenuItem>
        <MenuItem id='logout' onClick={(event) => this.menuItemClicked(event)}>Logout</MenuItem>
      </Menu>
      </div>
    );
  }
}
