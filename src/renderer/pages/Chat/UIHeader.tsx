import React from 'react';
import { Icon, IconButton, Typography } from '@mui/material';

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
    let IconOrIconButtonObject = null;
    if (this.props.icon != null) {
      if (this.iconButtonClicked != null) {
        IconOrIconButtonObject = <IconButton className="UIHeader_IconButton" onClick={this.iconButtonClicked}>{this.icon}</IconButton>;
      }
      else {
        IconOrIconButtonObject = <Icon className="UIHeader_Icon">{this.icon}</Icon>;
      }
    }

    return(
      <div className="UIHeader_Container">
          {IconOrIconButtonObject}
          <Typography variant="h5">{this.caption}</Typography>
          <div className="UIHeader_Misc">
            {this.misc}
          </div>
      </div>
    );
  }
}
