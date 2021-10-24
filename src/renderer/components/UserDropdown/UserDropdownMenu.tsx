import React, { ReactElement, Ref, RefObject } from 'react';
import { Avatar, ExtendButtonBase, IconButtonTypeMap, IconButton, Menu, MenuItem } from '@mui/material';
import { IUserDropdownMenu, IUserDropdownMenuFunctions } from 'renderer/interfaces';
import GLOBALS from 'renderer/globals';

export default class UserDropdownMenu extends React.Component {
  menuFunctions: IUserDropdownMenuFunctions;

  constructor(props: IUserDropdownMenu) {
    super(props);
    this.menuFunctions = props.menuFunctions;
    this.state = { anchorEl: null, open: Boolean(this.state.anchorEl) };

    this.handleClose = this.handleClose.bind(this);
    this.buttonClicked = this.buttonClicked.bind(this);
    this.menuItemClicked = this.menuItemClicked.bind(this);
  }

  state = {
    anchorEl: null,
    open: false
  }

  buttonClicked(event) {
    this.setState({ open: !this.state.open, anchorEl: event.currentTarget });
  }

  menuItemClicked(event: React.ReactElement<any, string | React.JSXElementConstructor<any>>) {
    switch(event.target.id) {
      case 'settings':
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
          <Avatar src={`https://api.novastudios.tk/Media/Avatar/${GLOBALS.UUID}?size=64`}/>
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
        <MenuItem id='settings' onClick={(event) => this.menuItemClicked(event)}>Settings</MenuItem>
        <MenuItem id='logout' onClick={(event) => this.menuItemClicked(event)}>Logout</MenuItem>
      </Menu>
      </div>
    );
  }
}
