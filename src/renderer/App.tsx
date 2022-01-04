import React from 'react';
import { Router, Route } from 'react-router-dom';
import './App.global.css';
import AuthPage from 'renderer/pages/Auth';
import ChatPage from 'renderer/pages/Chat';
import { events, history, Navigate, SetAuth } from 'shared/helpers';
import { SettingsManager } from 'shared/SettingsManager';
import 'renderer/events';
import GLOBALS from 'shared/globals';
import { AppStyles, AppTheme } from 'renderer/AppTheme';
import { ToastContainer } from 'react-toastify';
import SettingsPage from 'renderer/pages/Settings';
import { ClassNameMap, ThemeProvider, Typography } from '@mui/material';
import { Theme } from 'types/enums';
import { GlobalStyles } from '@mui/styled-engine';
import { DefaultTheme, Styles } from '@mui/styles';

interface IAppState {
  theme: Theme,
  styles: Styles<DefaultTheme, ClassNameMap<"@global">>,
  isConnectedToInternet: boolean
}

class App extends React.Component<undefined> {
  state: IAppState;

  constructor(props: undefined) {
    super(props);
    SettingsManager.Init();
    Navigate(GLOBALS.HomePath, null);
    SetAuth();

    this.state = {
      theme: AppTheme(),
      styles: AppStyles(),
      isConnectedToInternet: true
    };
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
          position="bottom-left"
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
        <Router history={history}>
          <Route path="/login">
            <AuthPage login />
          </Route>
          <Route path="/register">
            <AuthPage register />
          </Route>
          <Route path="/chat" component={ChatPage} />
          <Route path="/settings" component={SettingsPage} />
        </Router>
      </ThemeProvider>
    );
  }
}

export default App;
