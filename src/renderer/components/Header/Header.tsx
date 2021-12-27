import React from 'react';
import { Icon, IconButton, Typography } from '@mui/material';
import type { IHeaderProps } from 'types/interfaces';

export default class Header extends React.Component<IHeaderProps> {

  render() {
    let IconObject = null;
    if (this.props.icon != null) {
      if (this.props.onClick != null) {
        IconObject = <IconButton className='Header_IconButton' onClick={this.props.onClick}>{this.props.icon}</IconButton>;
      }
      else {
        IconObject = <Icon className='Header_Icon'>{this.props.icon}</Icon>;
      }
    }

    return(
      <div className='Header'>
          {IconObject}
          <Typography variant='h5'>{this.props.caption}</Typography>
          <div className='Header_Misc'>
            {this.props.children}
          </div>
      </div>
    );
  }
}
