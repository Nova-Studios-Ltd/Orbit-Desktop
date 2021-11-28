import React from 'react';
import { Button, IconButton, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Close as CloseIcon, Settings as SettingsIcon } from '@mui/icons-material';
import AppNotification from 'renderer/components/Notification/Notification';
import { ISettingsPageProps } from 'types/interfaces';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';
import Header from 'renderer/components/Header/Header';
import { copyToClipboard, Navigate } from 'shared/helpers';
import GLOBALS from 'shared/globals';
import { AppStyles } from 'renderer/AppTheme';

class SettingsPage extends React.Component {
  constructor(props: ISettingsPageProps) {
    super(props);

    this.exitSettings = this.exitSettings.bind(this);
  }

  exitSettings() {
    Navigate('/chat', null);
  }

  render() {
    return(
      <div className='Page Settings_Page_Container'>
        <Header caption='Settings' icon={<SettingsIcon />}>
          <IconButton onClick={this.exitSettings}><CloseIcon /></IconButton>
        </Header>
        <div className='Settings_Page_InnerContainer'>
          <Button variant='outlined' onClick={async () => {
            await copyToClipboard(GLOBALS.userData.token).then((result: boolean) => {
              if (result) {
                new AppNotification({ body: 'Copied token to clipboard', notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
              }
            });
          }}>Copy Token to Clipboard</Button>
        </div>
      </div>
    );
  }
}

export default withStyles(AppStyles)(SettingsPage);
