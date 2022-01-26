import React from 'react';
import { Router, Route } from 'react-router-dom';
import './App.global.css';
import AuthPage from 'renderer/pages/Auth';
import ChatPage from 'renderer/pages/Chat';
import FriendsPage from 'renderer/pages/Friends';
import { copyToClipboard, Debug, events, HandleWebsocket, history, ipcRenderer, Manager, Navigate, RemoveCachedCredentials } from 'renderer/helpers';
import 'renderer/events';
import { AppStyles, AppTheme } from 'renderer/AppTheme';
import { ToastContainer } from 'react-toastify';
import SettingsPage from 'renderer/pages/Settings';
import { Avatar, ClassNameMap, Divider, DividerProps, Drawer, List, ThemeProvider, Typography } from '@mui/material';
import { BugReport as BugIcon, Chat as ChatIcon, Logout as LogoutIcon, People as PeopleIcon, Refresh as RefreshIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { Theme, NotificationAudienceType, NotificationStatusType } from 'types/enums';
import { GlobalStyles } from '@mui/styled-engine';
import { DefaultTheme, Styles } from '@mui/styles';
import HybridListItem from 'renderer/components/List/HybridListItem';
import type { IHybridListItemSkeleton } from 'renderer/components/List/HybridListItem';
import AppNotification from 'renderer/components/Notification/Notification';
import AppIcon from '../../assets/icon.svg';
import { Dictionary } from 'main/dictionary';

interface IAppState {
  theme: Theme,
  styles: Styles<DefaultTheme, ClassNameMap<"@global">>,
  isConnectedToInternet: boolean,
  navigationDrawerOpen: boolean,
  currentRoute: string
}

class App extends React.Component {
  state: IAppState;

  constructor(props: never) {
    super(props);

    Manager.onReady = () => {

    }

    this.navigationDrawerItemClicked = this.navigationDrawerItemClicked.bind(this);
    this.toggleNavigationDrawer = this.toggleNavigationDrawer.bind(this);
    this.onNavigationDrawerOpened = this.onNavigationDrawerOpened.bind(this);
    this.logout = this.logout.bind(this);

    this.state = {
      theme: AppTheme(),
      styles: AppStyles(),
      isConnectedToInternet: true,
      navigationDrawerOpen: false,
      currentRoute: 'chat'
    };
  }

  async navigationDrawerItemClicked(event: React.MouseEvent<HTMLDivElement>) {
    switch (event.currentTarget.id) {
      case 'chat':
        if (event.type == 'click') {
          this.setState({ currentRoute: event.currentTarget.id });
          Navigate('/chat', null);
        }
        break;
      case 'friends':
        if (event.type == 'click') {
          this.setState({ currentRoute: event.currentTarget.id });
          Navigate('/friends', null);
        }
        break;
      case 'settings':
        if (event.type == 'click') {
          this.setState({ currentRoute: event.currentTarget.id });
          Navigate('/settings', null);
        }
        break;
      case 'reload':
        if (event.type == 'click') {
          window.location.reload();
        }
        break;
      case 'debug':
        if (event.type == 'click') {
          ipcRenderer.send('openDevTools');
        }
        break;
      case 'user':
        {
          const clipboardContent = event.type == 'click' ? `${Manager.UserData.username}#${Manager.UserData.discriminator}` : Manager.UserData.uuid;
          const resultMessage = event.type == 'click' ? 'Copied username and discriminator to clipboard' : 'Copied UUID to clipboard';
          copyToClipboard(clipboardContent).then((result: boolean) => {
            if (result) {
              new AppNotification({ body: resultMessage, notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
            }
          });
        }
        return;
      case 'logout':
        this.logout();
        break;
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

  logout() {
    RemoveCachedCredentials();
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

    if (Manager != null) {
      if (Manager.UserData.uuid != null && Manager.UserData.uuid.length > 0 && Manager.UserData.token != null && Manager.UserData.token.length > 0) {
        Manager.WriteConst("LoggedOut", false);
        HandleWebsocket();
        Navigate('/chat', null);
      }
      else {
        Navigate('/login', null);
      }
    }
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

    const navigationItemsTop: Array<IHybridListItemSkeleton>  = [
      { id: 'chat', text: 'Chat', selectable: true, icon: (() => (<ChatIcon />))() },
      { id: 'friends', text: 'Friends', selectable: true, icon: (() => (<PeopleIcon />))() },
      { isDivider: true },
      { id: 'reload', text: 'Reload App', icon: (() => (<RefreshIcon />))() },
      { id: 'debug', text: 'DevTools', icon: (() => (<BugIcon />))() },
    ];

    const navigationItemsBottom: Array<IHybridListItemSkeleton> = [
      { id: 'user', text: `${Manager.UserData.username}#${Manager.UserData.discriminator}`, icon: (() => (<Avatar src={`https://api.novastudios.tk/Media/Avatar/${Manager.UserData.uuid}?size=64&${Date.now()}`} />))() },
      { id: 'logout', text: 'Logout', icon: (() => (<LogoutIcon />))() },
      { id: 'settings', text: 'Settings', selectable: true, icon: (() => (<SettingsIcon />))() }
    ];

    const mapSkeletonToListItem = (element: IHybridListItemSkeleton) => {
      if (element.isDivider) {
        return <Divider />
      }

      return <HybridListItem id={element.id} text={element.text} icon={element.icon} selected={(element.selectable && element.id == this.state.currentRoute)} onClick={element.onClick != null ? element.onClick : this.navigationDrawerItemClicked} onContextMenu={element.onContextMenu != null ? element.onContextMenu : this.navigationDrawerItemClicked} />
    }

    const navigationDrawerListTopJSXArray = navigationItemsTop.map((element) => {
      return mapSkeletonToListItem(element);
    });

    const navigationDrawerListBottomJSXArray = navigationItemsBottom.map((element) => {
      return mapSkeletonToListItem(element);
    });

    return (
      <ThemeProvider theme={this.state.theme}>
        <GlobalStyles styles={this.state.styles} />
        <ToastContainer
          position="bottom-right"
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
              <Typography sx={{ padding: 1 }} variant='h5'>{Manager.AppName} {Manager.AppVersion}</Typography>
            </div>
            <Divider />
            {navigationDrawerListTopJSXArray}
          </List>
          <List className='NavigationDrawerListBottom'>
            {navigationDrawerListBottomJSXArray}
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
