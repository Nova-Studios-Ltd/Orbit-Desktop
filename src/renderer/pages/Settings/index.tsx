import React, { ChangeEvent, MouseEvent } from 'react';
import { Avatar, Button, FormControlLabel, FormGroup, IconButton, Switch } from '@mui/material';
import { Close as CloseIcon, Settings as SettingsIcon, Add as AddIcon} from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import AppNotification from 'renderer/components/Notification/Notification';
import Header from 'renderer/components/Header/Header';
import { ConductLogin, copyToClipboard, ipcRenderer } from 'shared/helpers';
import SettingsSection from 'renderer/components/Settings/SettingsSection';
import GLOBALS from 'shared/globals';
import { NotificationAudienceType, NotificationStatusType, Theme } from 'types/enums';
import YesNoDialog from 'renderer/components/Dialogs/YesNoDialog';
import { SettingsManager } from 'shared/SettingsManager';

interface ISettingsPageProps {
  onNavigationDrawerOpened: (event: React.MouseEvent<HTMLButtonElement>, open?: boolean) => void
}

interface ISettingsPageState {
  UpdatedUser: boolean,
  confirmUserAccountDeletionDialogOpen: boolean,
  darkThemeEnabled: boolean
}

export default class SettingsPage extends React.Component<ISettingsPageProps> {
  state: ISettingsPageState;

  constructor(props: ISettingsPageProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
    this.closeUserAccountDeletionDialog = this.closeUserAccountDeletionDialog.bind(this);
    this.exitSettings = this.exitSettings.bind(this);
    this.updateUserAvatar = this.updateUserAvatar.bind(this);
    this.updatedAvatar = this.updatedAvatar.bind(this);

    ipcRenderer.on('AvatarSet', this.updatedAvatar);

    this.state = {
      UpdatedUser: false,
      confirmUserAccountDeletionDialogOpen: false,
      darkThemeEnabled: Boolean(SettingsManager.Settings.Theme)
    }
  }

  handleClick(event: MouseEvent<HTMLButtonElement>) {
    switch (event.currentTarget.id) {
      case 'deleteAccount':
        this.setState({ confirmUserAccountDeletionDialogOpen: true });
        break;
    }
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

  closeUserAccountDeletionDialog() {
    this.setState({ confirmUserAccountDeletionDialogOpen: false });
  }

  exitSettings() {
    ConductLogin();
  }

  async updateUserAvatar() {
    const image = await ipcRenderer.invoke("OpenFile");
    if (image != undefined) ipcRenderer.send("SETAvatar", GLOBALS.userData.uuid, image);
  }

  updatedAvatar() {
    this.setState({UpdatedUser: true});
  }

  render() {
    if (this.state.UpdatedUser) {
      this.setState({UpdatedUser: false});
      return (<></>)
    }
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
            <IconButton className='OverlayContainer' onClick={this.updateUserAvatar}>
              <Avatar sx={{ width: 128, height: 128 }} src={`https://api.novastudios.tk/Media/Avatar/${GLOBALS.userData.uuid}?size=128&${Date.now()}`}/>
              <AddIcon fontSize='large' className='Overlay'/>
            </IconButton>
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
