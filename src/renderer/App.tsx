import React from 'react';
import { Router, Route } from 'react-router-dom';
import './App.global.css';
import AuthPage from 'renderer/pages/Auth';
import ChatPage from 'renderer/pages/Chat';
import FriendsPage from 'renderer/pages/Friends';
import { copyToClipboard, events, history, ipcRenderer, Navigate, RemoveCachedCredentials, SetAuth } from 'shared/helpers';
import { SettingsManager } from 'shared/SettingsManager';
import 'renderer/events';
import GLOBALS from 'shared/globals';
import { AppStyles, AppTheme } from 'renderer/AppTheme';
import { ToastContainer } from 'react-toastify';
import SettingsPage from 'renderer/pages/Settings';
import { Avatar, ClassNameMap, Divider, Drawer, List, ThemeProvider, Typography } from '@mui/material';
import { BugReport as BugIcon, Chat as ChatIcon, People as PeopleIcon, Refresh as RefreshIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { Theme, NotificationAudienceType, NotificationStatusType } from 'types/enums';
import { GlobalStyles } from '@mui/styled-engine';
import { DefaultTheme, Styles } from '@mui/styles';
import HybridListItem from 'renderer/components/List/HybridListItem';
import AppNotification from 'renderer/components/Notification/Notification';
import AppIcon from '../../assets/icon.svg';

interface IAppState {
  theme: Theme,
  styles: Styles<DefaultTheme, ClassNameMap<"@global">>,
  isConnectedToInternet: boolean,
  navigationDrawerOpen: boolean,
}

class App extends React.Component {
  state: IAppState;

  constructor(props: never) {
    super(props);
    SettingsManager.Init();
    Navigate(GLOBALS.HomePath, null);
    SetAuth();

    this.navigationDrawerItemClicked = this.navigationDrawerItemClicked.bind(this);
    this.toggleNavigationDrawer = this.toggleNavigationDrawer.bind(this);
    this.onNavigationDrawerOpened = this.onNavigationDrawerOpened.bind(this);

    this.state = {
      theme: AppTheme(),
      styles: AppStyles(),
      isConnectedToInternet: true,
      navigationDrawerOpen: false,
    };
  }

  async navigationDrawerItemClicked(event: React.MouseEvent<HTMLDivElement>) {
    switch (event.currentTarget.id) {
      case 'chat':
        Navigate('/chat', null);
        break;
      case 'friends':
        Navigate('/friends', null);
        break;
      case 'settings':
        Navigate('/settings', null);
        break;
      case 'reload':
        window.location.reload();
        break;
      case 'debug':
        ipcRenderer.send('openDevTools');
        break;
      case 'user':
        {
          const clipboardContent = event.type == 'click' ? `${GLOBALS.userData.username}#${GLOBALS.userData.discriminator}` : GLOBALS.userData.uuid;
          const resultMessage = event.type == 'click' ? 'Copied username and discriminator to clipboard' : 'Copied UUID to clipboard';
          copyToClipboard(clipboardContent).then((result: boolean) => {
            if (result) {
              new AppNotification({ body: resultMessage, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
            }
          });
        }
        return;
    }
    this.setState({ navigationDrawerOpen: false });
  }

  toggleNavigationDrawer(open?: boolean) {
    if (open != null) {
      this.setState({ navigationDrawerOpen: open });
    }
    else
    {
      this.setState((prevState: IAppState) => {
        return {
          navigationDrawerOpen: !prevState.navigationDrawerOpen
       }
      });
    }
  }

  Logout() {
    RemoveCachedCredentials();
    GLOBALS.loggedOut = true;
    Navigate('/login', null);
  }

  onNavigationDrawerOpened(_event: React.MouseEvent<HTMLButtonElement>, open?: boolean) {
    this.toggleNavigationDrawer(open);
  }

  componentDidMount() {
    // Will create memory leak, add a remove listener call on unmount

    events.on('appThemeChanged', () => {
      this.setState({ theme: AppTheme(), styles: AppStyles() });
    });
  }

  componentWillUnmount() {
    events.removeAllListeners('appThemeChanged');
  }

  render() {
    const NoInternetConnectionBanner = () => {
      if (!this.state.isConnectedToInternet) {
        return (
          <div className='NoInternetWarningContainer'>
            <Typography variant='subtitle1'>Connection to NovaAPI Failed</Typography>
            <Typography variant='caption'>You may have lost internet connection, or the servers are currently down.</Typography>
            <br />
            <Typography variant='caption'>Services will be temporarily unavailable until connection is restored.</Typography>
          </div>
        );
      }

      return null;
    }

    return (
      <ThemeProvider theme={this.state.theme}>
        <GlobalStyles styles={this.state.styles} />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          limit={3}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          draggable
          pauseOnHover={false}
          pauseOnFocusLoss={false}
        />
        <NoInternetConnectionBanner />
        <Drawer className='NavigationDrawer' anchor='left' open={this.state.navigationDrawerOpen} onClose={() => this.toggleNavigationDrawer(false)}>
          <List className='NavigationDrawerListTop'>
            <div className='NavigationDrawerBranding'>
              <img src={AppIcon} width='64' height='64' style={{ padding: 1, margin: 10 }} alt='App Logo'/>
              <Typography sx={{ padding: 1, marginRight: 1 }} variant='h5'>{GLOBALS.appName} {GLOBALS.appVersion}</Typography>
            </div>
            <HybridListItem id='chat' text='Chat' icon={<ChatIcon />} onClick={this.navigationDrawerItemClicked} />
            <HybridListItem id='friends' text='Friends' icon={<PeopleIcon />} onClick={this.navigationDrawerItemClicked} />
            <HybridListItem id='settings' text='Settings' icon={<SettingsIcon />} onClick={this.navigationDrawerItemClicked} />
            <Divider />
            <HybridListItem id='reload' text='Reload App' icon={<RefreshIcon />} onClick={this.navigationDrawerItemClicked} />
            <HybridListItem id='debug' text='DevTools' icon={<BugIcon />} onClick={this.navigationDrawerItemClicked} />
          </List>
          <List className='NavigationDrawerListBottom'>
            <HybridListItem id='user' text={`${GLOBALS.userData.username}#${GLOBALS.userData.discriminator}`} icon={<Avatar src={`https://api.novastudios.tk/Media/Avatar/${GLOBALS.userData.uuid}?size=64&${Date.now()}`} />} onClick={this.navigationDrawerItemClicked} onContextMenu={this.navigationDrawerItemClicked} />
          </List>
        </Drawer>
        <Router history={history}>
          <Route path="/login">
            <AuthPage login onNavigationDrawerOpened={this.onNavigationDrawerOpened} />
          </Route>
          <Route path="/register">
            <AuthPage register onNavigationDrawerOpened={this.onNavigationDrawerOpened} />
          </Route>
          <Route path="/chat">
            <ChatPage onNavigationDrawerOpened={this.onNavigationDrawerOpened} />
          </Route>
          <Route path="/friends">
            <FriendsPage onNavigationDrawerOpened={this.onNavigationDrawerOpened} />
          </Route>
          <Route path="/settings">
            <SettingsPage onNavigationDrawerOpened={this.onNavigationDrawerOpened} />
          </Route>
        </Router>
      </ThemeProvider>
    );
  }
}

export default App;
