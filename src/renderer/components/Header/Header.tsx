import React from 'react';
import { Icon, IconButton, Typography } from '@mui/material';
import { IHeaderProps } from 'dataTypes/interfaces';

export default class Header extends React.Component {
  caption: string;
  icon: any;
  iconButtonClicked: Function;
  misc: any;

  constructor(props: IHeaderProps) {
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
        IconObject = <IconButton className='Header_IconButton' onClick={this.iconButtonClicked}>{this.icon}</IconButton>;
      }
      else {
        IconObject = <Icon className='Header_Icon'>{this.icon}</Icon>;
      }
    }

    return(
      <div className='Header_Container'>
          {IconObject}
          <Typography variant='h5'>{this.caption}</Typography>
          <div className='Header_Misc'>
            {this.misc}
          </div>
      </div>
    );
  }
}
