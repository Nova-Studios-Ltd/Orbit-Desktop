import React, { ChangeEvent, MouseEvent } from 'react';
import { Avatar, Button, Card, Dialog, DialogContent, DialogActions, DialogTitle, FormControlLabel, FormGroup, IconButton, Switch, Typography } from '@mui/material';
import { Close as CloseIcon, Settings as SettingsIcon, Add as AddIcon} from '@mui/icons-material';
import { MD5 } from 'crypto-js';
import { Helmet } from 'react-helmet';
import AppNotification from 'renderer/components/Notification/Notification';
import Header from 'renderer/components/Header/Header';
import { ConductLogin, copyToClipboard, ipcRenderer } from 'shared/helpers';
import SettingsSection from 'renderer/components/Settings/SettingsSection';
import GLOBALS from 'shared/globals';
import { NotificationAudienceType, NotificationStatusType, Theme } from 'types/enums';
import YesNoDialog from 'renderer/components/Dialogs/YesNoDialog';
import { SettingsManager } from 'shared/SettingsManager';
import { IOpenFileDialogResults } from 'types/types';
import FormTextField from 'renderer/components/Form/FormTextField';

interface ISettingsPageProps {
  onNavigationDrawerOpened: (event: React.MouseEvent<HTMLButtonElement>, open?: boolean) => void
}

interface ISettingsPageState {
  avatarStateKey: string,
  usernameStateKey: string,
  darkThemeEnabled: boolean,
  confirmUserAccountDeletionDialogOpen: boolean,
  editUsernameDialogOpen: boolean,
  editUsernameDialogField: string
}

export default class SettingsPage extends React.Component<ISettingsPageProps> {
  state: ISettingsPageState;

  constructor(props: ISettingsPageProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
    this.openChangeUsernameDialog = this.openChangeUsernameDialog.bind(this);
    this.closeChangeUsernameDialog = this.closeChangeUsernameDialog.bind(this);
    this.submitNewUsername = this.submitNewUsername.bind(this);
    this.closeUserAccountDeletionDialog = this.closeUserAccountDeletionDialog.bind(this);
    this.exitSettings = this.exitSettings.bind(this);
    this.updateUserAvatar = this.updateUserAvatar.bind(this);
    this.avatarUpdated = this.avatarUpdated.bind(this);
    this.usernameUpdated = this.usernameUpdated.bind(this);

    ipcRenderer.on('AvatarSet', this.avatarUpdated);
    ipcRenderer.on('UsernameUpdated', this.usernameUpdated);

    this.state = {
      avatarStateKey: MD5(Date.now().toString()).toString(),
      usernameStateKey: MD5(Date.now().toString()).toString(),
      darkThemeEnabled: Boolean(SettingsManager.Settings.Theme),
      confirmUserAccountDeletionDialogOpen: false,
      editUsernameDialogOpen: false,
      editUsernameDialogField: GLOBALS.userData.username
    }
  }

  handleClick(event: MouseEvent<HTMLButtonElement>) {
    switch (event.currentTarget.id) {
      case 'deleteAccount':
        this.setState({ confirmUserAccountDeletionDialogOpen: true });
        break;
    }
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    this.setState({[name]: value});
  }

  handleToggle(event: ChangeEvent<HTMLInputElement>) {
    switch (event.currentTarget.id) {
      case 'darkTheme':
        this.setState((prevState: ISettingsPageState) => ({ darkThemeEnabled: !prevState.darkThemeEnabled }), () => {
          SettingsManager.SetTheme(this.state.darkThemeEnabled ? Theme.Dark : Theme.Light);
        });
        break;
    }
  }

  deleteAccount() {
    ipcRenderer.send('DELETEUser', GLOBALS.userData.uuid);
    this.closeUserAccountDeletionDialog();
  }

  openChangeUsernameDialog() {
    this.setState({ editUsernameDialogOpen: true, editUsernameDialogField: GLOBALS.userData.username });
  }

  closeChangeUsernameDialog() {
    this.setState({ editUsernameDialogOpen: false, editUsernameDialogField: '' });
  }

  submitNewUsername() {
    ipcRenderer.send('UPDATEUsername', GLOBALS.userData.uuid, this.state.editUsernameDialogField);
    this.closeChangeUsernameDialog();
  }

  closeUserAccountDeletionDialog() {
    this.setState({ confirmUserAccountDeletionDialogOpen: false });
  }

  exitSettings() {
    ConductLogin();
  }

  async updateUserAvatar() {
    ipcRenderer.invoke("OpenFile").then((data: IOpenFileDialogResults) => {
      if (data != undefined && data.path != null) ipcRenderer.send("SETAvatar", GLOBALS.userData.uuid, data.path);
    });
  }

  avatarUpdated() {
    this.setState({ avatarStateKey: MD5(Date.now().toString()).toString() });
  }

  usernameUpdated(result: boolean, newUsername?: string) {
    if (result && newUsername != null) {
      GLOBALS.userData.username = newUsername;
      this.setState({ usernameStateKey: MD5(Date.now().toString()).toString() });
    }
  }

  render() {
    return(
      <div className='Page Settings_Page_Container'>
        <Helmet>
          <title>{`${GLOBALS.appName} ${GLOBALS.appVersion} - Settings`}</title>
        </Helmet>
        <Header caption='Settings' icon={<SettingsIcon />}>
          <IconButton onClick={this.exitSettings}><CloseIcon /></IconButton>
        </Header>
        <div className='Settings_Page_InnerContainer'>
          <SettingsSection title='User'>
            <Card className='Settings_User_Section_Card'>
              <IconButton className='OverlayContainer' onClick={this.updateUserAvatar}>
                <Avatar key={this.state.avatarStateKey} sx={{ width: 128, height: 128 }} src={`https://api.novastudios.tk/Media/Avatar/${GLOBALS.userData.uuid}?size=128&${Date.now()}`}/>
                <AddIcon fontSize='large' className='Overlay'/>
              </IconButton>
              <Typography key={this.state.usernameStateKey} variant='h5'>{GLOBALS.userData.username}#{GLOBALS.userData.discriminator}</Typography>
              <Button onClick={this.openChangeUsernameDialog}>Edit Username</Button>
              <Button disabled>Change Password</Button>
              <Button disabled>Logout</Button>
            </Card>
          </SettingsSection>
          <SettingsSection title='Appearance'>
            <FormGroup>
              <FormControlLabel label='Dark Theme' control={<Switch id='darkTheme' title='Dark Theme' onChange={this.handleToggle} checked={this.state.darkThemeEnabled} />} />
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
          <Dialog open={this.state.editUsernameDialogOpen}>
            <DialogTitle>Change Username</DialogTitle>
            <DialogContent sx={{ overflow: 'hidden' }}>
              <FormTextField id='editUsernameDialogField' label='Username' placeholder='New Username' autoFocus value={this.state.editUsernameDialogField} onChange={this.handleChange}></FormTextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.closeChangeUsernameDialog}>Cancel</Button>
              <Button onClick={this.submitNewUsername}>Change</Button>
            </DialogActions>
          </Dialog>
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
