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

  buttonClicked(event: MouseEvent<HTMLButtonElement, MouseEvent>) {
    this.setState({ open: !this.state.open, anchorEl: event.currentTarget });
  }

  async menuItemClicked(event: MouseEvent<HTMLLIElement, MouseEvent>, ...args) {
    switch(event.currentTarget.id) {
      case 'userinfo':
          const clipboardContent = args[0] == 0 ? `${this.userData.username}#${this.userData.discriminator}` : this.userData.uuid;
          const resultMessage = args[0] == 0 ? 'Copied username and discriminator to clipboard' : 'Copied UUID to clipboard';
          await copyToClipboard(clipboardContent).then((result: boolean) => {
            if (result) {
              new AppNotification({ body: resultMessage, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
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

        <MenuItem id='userinfo' onClick={(event) => this.menuItemClicked(event, 0)} onContextMenu={(event) => this.menuItemClicked(event, 1)}>
          <Typography variant='subtitle1'>{this.userData.username}<Typography variant='caption'>#{this.userData.discriminator}</Typography></Typography>
        </MenuItem>
        <MenuItem id='settings' onClick={(event) => this.menuItemClicked(event)}>Settings</MenuItem>
        <MenuItem id='logout' onClick={(event) => this.menuItemClicked(event)}>Logout</MenuItem>
      </Menu>
      </div>
    );
  }
}
