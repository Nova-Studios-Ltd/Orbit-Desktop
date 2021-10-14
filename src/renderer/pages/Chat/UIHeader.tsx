import React from 'react';
import { IconButton, Typography } from '@mui/material';

export default class UIHeader extends React.Component {
  caption: string;
  icon: any;
  iconButtonClicked: any;
  misc: any;

  constructor(props) {
    super(props);
    this.caption = props.caption;
    this.icon = props.icon;
    this.iconButtonClicked = props.onClick;
    this.misc = props.misc;
  }

  render() {
    return(
      <div className="UIHeader_Container">
          <IconButton className="Chat_IconButton" onClick={this.iconButtonClicked}>{this.icon}</IconButton>
          <Typography variant="h5">{this.caption}</Typography>
          <div className="UIHeader_Misc">
            {this.misc}
          </div>
      </div>
    );
  }
}
