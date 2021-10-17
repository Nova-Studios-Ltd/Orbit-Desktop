import React from 'react';
import { Icon, IconButton, Typography } from '@mui/material';
import { UIHeaderProps } from 'renderer/interfaces';

export default class UIHeader extends React.Component {
  caption: string;
  icon: any;
  iconButtonClicked: Function;
  misc: any;

  constructor(props: UIHeaderProps) {
    super(props);
    this.caption = props.caption;
    this.icon = props.icon;
    this.iconButtonClicked = props.onClick;
    this.misc = props.misc;
  }

  render() {
    let IconObject = null;
    if (this.icon != null) {
      if (this.iconButtonClicked != null) {
        IconObject = <IconButton className="UIHeader_IconButton" onClick={this.iconButtonClicked}>{this.icon}</IconButton>;
      }
      else {
        IconObject = <Icon className="UIHeader_Icon">{this.icon}</Icon>;
      }
    }

    return(
      <div className="UIHeader_Container">
          {IconObject}
          <Typography variant="h5">{this.caption}</Typography>
          <div className="UIHeader_Misc">
            {this.misc}
          </div>
      </div>
    );
  }
}
