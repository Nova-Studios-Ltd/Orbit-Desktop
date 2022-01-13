import React from 'react';
import { Icon, IconButton, Typography } from '@mui/material';

interface IHeaderProps {
  caption?: string,
  icon?: JSX.Element,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void,
  children?: JSX.Element | JSX.Element[]
}

export default class Header extends React.Component<IHeaderProps> {

  render() {
    const IconElement = () => {
      if (this.props.icon != null) {
        if (this.props.onClick != null) {
          return (
            <IconButton className='Header_IconButton' onClick={this.props.onClick}>{this.props.icon}</IconButton>
          );
        }

        return (
          <Icon className='Header_Icon'>{this.props.icon}</Icon>
        );

      }
      return null;
    }

    return(
      <div className='Header'>
          <IconElement />
          <Typography variant='h5' className='Header_Caption'>{this.props.caption}</Typography>
          <div className='Header_Misc'>
            {this.props.children}
          </div>
      </div>
    );
  }
}
