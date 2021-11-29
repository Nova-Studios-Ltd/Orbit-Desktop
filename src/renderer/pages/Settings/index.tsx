import React from 'react';
import { Button, FormControlLabel, FormGroup, IconButton, Switch, Typography } from '@mui/material';
import { Close as CloseIcon, Settings as SettingsIcon } from '@mui/icons-material';
import AppNotification from 'renderer/components/Notification/Notification';
import type { ISettingsPageProps } from 'types/interfaces';
import Header from 'renderer/components/Header/Header';
import { ConductLogin, copyToClipboard } from 'shared/helpers';
import SettingsSection from 'renderer/components/Settings/SettingsSection';
import GLOBALS from 'shared/globals';

export default class SettingsPage extends React.Component {
  constructor(props: ISettingsPageProps) {
    super(props);

    this.exitSettings = this.exitSettings.bind(this);
  }

  exitSettings() {
    ConductLogin();
  }

  render() {
    return(
      <div className='Page Settings_Page_Container'>
        <Header caption='Settings' icon={<SettingsIcon />}>
          <IconButton onClick={this.exitSettings}><CloseIcon /></IconButton>
        </Header>
        <div className='Settings_Page_InnerContainer'>
          <SettingsSection title='Appearance'>
            <FormGroup>
              <FormControlLabel label='Dark Theme' control={<Switch title='Dark Theme' checked />} />
            </FormGroup>
          </SettingsSection>
          <SettingsSection title='Notifications'>

          </SettingsSection>
          <SettingsSection title='Accessibility'>

          </SettingsSection>
          <SettingsSection title='Advanced'>
            <Button variant='outlined' onClick={async () => {
              await copyToClipboard(GLOBALS.userData.token).then((result: boolean) => {
                if (result) {
                  new AppNotification({ body: 'Copied token to clipboard', notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
                }
              });
            }}>Copy Token to Clipboard</Button>
          </SettingsSection>
        </div>
      </div>
    );
  }
}
