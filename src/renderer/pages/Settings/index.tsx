import React from 'react';
import { Button, FormControlLabel, FormGroup, IconButton, Switch, Typography } from '@mui/material';
import { Close as CloseIcon, Settings as SettingsIcon } from '@mui/icons-material';
import AppNotification from 'renderer/components/Notification/Notification';
import type { ISettingsPageProps, ISettingsPageState } from 'types/interfaces';
import Header from 'renderer/components/Header/Header';
import { ConductLogin, copyToClipboard, ipcRenderer } from 'shared/helpers';
import SettingsSection from 'renderer/components/Settings/SettingsSection';
import GLOBALS from 'shared/globals';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';
import YesNoDialog from 'renderer/components/Dialogs/YesNoDialog';

export default class SettingsPage extends React.Component {
  state: ISettingsPageState;

  constructor(props: ISettingsPageProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
    this.closeUserAccountDeletionDialog = this.closeUserAccountDeletionDialog.bind(this);
    this.exitSettings = this.exitSettings.bind(this);

    this.state = {
      confirmUserAccountDeletionDialogOpen: false
    }
  }

  handleClick(event: any) {
    switch (event.currentTarget.id) {
      case 'deleteAccount':
        this.setState({ confirmUserAccountDeletionDialogOpen: true });
        break;
    }
  }

  deleteAccount() {
    ipcRenderer.send('deleteAccount', GLOBALS.userData.uuid);
    this.closeUserAccountDeletionDialog();
  }

  closeUserAccountDeletionDialog() {
    this.setState({ confirmUserAccountDeletionDialogOpen: false });
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
            <Button className='Settings_Section_Item' variant='outlined' onClick={async () => {
              await copyToClipboard(GLOBALS.userData.token).then((result: boolean) => {
                if (result) {
                  new AppNotification({ body: 'Copied token to clipboard', notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
                }
              });
            }}>Copy Token to Clipboard</Button>
            <Button id='deleteAccount' className='Settings_Section_Item' variant='outlined' color='error' onClick={this.handleClick}>Delete Account</Button>
          </SettingsSection>
          <YesNoDialog
          title='Delete Account'
          body='Your account will be immediately erased from our system and you will have to create a new account to be able to use our service. Your message history will be lost. However, messages you have already sent will stay until the respective channel(s) are deleted. Thank you for using Nova Chat.'
          confirmButtonText='Delete'
          denyButtonText='Cancel'
          onDeny={this.closeUserAccountDeletionDialog}
          onConfirm={this.deleteAccount}
          show={this.state.confirmUserAccountDeletionDialogOpen} />
        </div>
      </div>
    );
  }
}
