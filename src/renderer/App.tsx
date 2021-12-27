import React from 'react';
import { Router, Route } from 'react-router-dom';
import './App.global.css';
import AuthPage from 'renderer/pages/Auth';
import ChatPage from 'renderer/pages/Chat';
import { Debug, events, history, Navigate, SetAuth } from 'shared/helpers';
import { Settings } from 'shared/SettingsManager';
import 'renderer/events';
import GLOBALS from 'shared/globals';
import { AppStyles, AppTheme } from 'renderer/AppTheme';
import { ToastContainer } from 'react-toastify';
import SettingsPage from 'renderer/pages/Settings';
import { ClassNameMap, ThemeProvider } from '@mui/material';
import { LogContext, Theme } from 'types/enums';
import { GlobalStyles } from '@mui/styled-engine';
import { DefaultTheme, Styles } from '@mui/styles';

interface IAppState {
  theme: Theme,
  styles: Styles<DefaultTheme, ClassNameMap<"@global">>
}

class App extends React.Component<undefined> {
  state: IAppState;

  constructor(props: undefined) {
    super(props);
    Settings.Init();
    Navigate(GLOBALS.HomePath, null);
    SetAuth();

    this.state = {
      theme: AppTheme(),
      styles: AppStyles()
    };
  }

  componentDidMount() {
    // Will create memory leak, add a remove listener call on unmount
    events.on('appThemeChanged', () => {
      this.setState({ theme: AppTheme(), styles: AppStyles() });
    });
  }

  render() {
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
