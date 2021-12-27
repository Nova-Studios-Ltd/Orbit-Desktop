import { Typography } from '@mui/material';
import React, { ReactNode } from 'react';

interface ISettingsSectionProps {
  title: string,
  children: Element | ReactNode
}

export default class SettingsSection extends React.Component<ISettingsSectionProps> {
  title: string;

  constructor(props: ISettingsSectionProps) {
    super(props);
    this.title = props.title;
  }

  render() {
    return(
      <div className='Settings_Section'>
        <Typography className='Settings_Section_Title' variant='h5'>{this.title}</Typography>
        {this.props.children}
      </div>
    );
  }
}
