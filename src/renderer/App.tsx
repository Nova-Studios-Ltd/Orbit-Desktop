import React from 'react';
import { Router, Route } from 'react-router-dom';
import './App.global.css';
import AuthPage from 'renderer/pages/Auth';
import ChatPage from 'renderer/pages/Chat';
import { history, Navigate, SetAuth } from 'shared/helpers';
import 'renderer/events';
import GLOBALS from 'shared/globals';
import { AppTheme } from 'renderer/AppTheme';
import { ToastContainer } from 'react-toastify';
import SettingsPage from 'renderer/pages/Settings';
import { ThemeProvider } from '@mui/material';

Navigate(GLOBALS.HomePath, null);
SetAuth();

function App() {
  return (
    <ThemeProvider theme={AppTheme}>
      <ToastContainer position='bottom-left'
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
        <Route path='/login'>
          <AuthPage login/>
        </Route>
        <Route path='/register'>
          <AuthPage register/>
        </Route>
        <Route path='/chat' component={ChatPage} />
        <Route path='/settings' component={SettingsPage} />
      </Router>
    </ThemeProvider>
  );
}

export default App;
