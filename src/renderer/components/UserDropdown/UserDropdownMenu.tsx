import React, {MouseEvent} from 'react';
import { Avatar, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import type { IUserDropdownMenu, IUserDropdownMenuFunctions, IUserDropdownMenuState } from 'types/interfaces';
import UserData from 'structs/UserData';
import { copyToClipboard, Navigate } from 'shared/helpers';
import AppNotification from 'renderer/components/Notification/Notification';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';

export default class UserDropdownMenu extends React.Component<IUserDropdownMenu> {
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

  buttonClicked(event: MouseEvent<HTMLButtonElement>) {
    this.setState((prevState: IUserDropdownMenuState) => ({ open: !prevState.open, anchorEl: event.currentTarget }));
  }

  async menuItemClicked(event: MouseEvent<HTMLLIElement, globalThis.MouseEvent>, contextMenu?: number) {
    switch(event.currentTarget.id) {
      case 'userinfo': {
          const clipboardContent = contextMenu == 0 ? `${this.userData.username}#${this.userData.discriminator}` : this.userData.uuid;
          const resultMessage = contextMenu == 0 ? 'Copied username and discriminator to clipboard' : 'Copied UUID to clipboard';
          await copyToClipboard(clipboardContent).then((result: boolean) => {
            if (result) {
              new AppNotification({ body: resultMessage, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
            }
          });
          break;
        }
      case 'settings':
        Navigate('/settings', null);
        break;
      case 'logout':
        this.menuFunctions.logout();
        break;
    }

    this.setState({ open: false, anchorEl: null });
  }

  handleClose() {
    this.setState({ open: false, anchorEl: null });
  }

  render() {
    return(
      <div>
        <IconButton onClick={this.buttonClicked}>
          <Avatar src={`https://api.novastudios.tk/Media/Avatar/${this.userData.uuid}?size=64&${Date.now()}`} />
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
