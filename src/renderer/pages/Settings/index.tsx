import React from 'react';
import { IconButton } from '@mui/material';
import { Close as CloseIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { ISettingsPageProps } from 'dataTypes/interfaces';
import Header from 'renderer/components/Header/Header';
import { history } from 'shared/helpers';

export default class SettingsPage extends React.Component {
  constructor(props: ISettingsPageProps) {
    super(props);

    this.exitSettings = this.exitSettings.bind(this);
  }

  exitSettings() {
    history.push('/chat', null);
  }

  render() {
    return(
      <div>
        <Header caption='Settings' icon={<SettingsIcon />}>
          <IconButton onClick={this.exitSettings}><CloseIcon /></IconButton>
        </Header>
      </div>
    );
  }
}
