import React from 'react';
import { IconButton, Typography } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { Logout } from '../../helpers';

export default class UIHeader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div className="UIHeader_Container">
          <IconButton className="Chat_IconButton" onClick={Logout}><LogoutIcon /></IconButton>
          <Typography variant="h5">Chat</Typography>
          <div className="UIHeader_Misc">

          </div>
      </div>
    );
  }
}
