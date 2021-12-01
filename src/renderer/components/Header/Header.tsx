import React, { ReactChildren } from 'react';
import { Icon, IconButton, Typography } from '@mui/material';
import type { IHeaderProps } from 'types/interfaces';

export default class Header extends React.Component {
  caption: string;
  icon: any;
  onClick: Function;
  children: ReactChildren;

  constructor(props: IHeaderProps) {
    super(props);
    this.caption = props.caption;
    this.icon = props.icon;
    this.onClick = props.onClick;
    this.children = props.children;
  }

  render() {
    let IconObject = null;
    if (this.icon != null) {
      if (this.onClick != null) {
        IconObject = <IconButton className='Header_IconButton' onClick={this.onClick}>{this.icon}</IconButton>;
      }
      else {
        IconObject = <Icon className='Header_Icon'>{this.icon}</Icon>;
      }
    }

    return(
      <div className='Header'>
          {IconObject}
          <Typography variant='h5'>{this.caption}</Typography>
          <div className='Header_Misc'>
            {this.children}
          </div>
      </div>
    );
  }
}
