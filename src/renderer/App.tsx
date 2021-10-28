import React from 'react';
import { Router, Route } from 'react-router-dom';
import './App.global.css';
import AuthPage from 'renderer/pages/Auth';
import ChatPage from 'renderer/pages/Chat';
import { history, Navigate } from './helpers';
import './events';
import GLOBALS from './globals';

Navigate(GLOBALS.HomePath, null);

function App() {
  return (
    <Router history={history}>
      <Route path='/login'>
        <AuthPage login/>
      </Route>
      <Route path='/register'>
        <AuthPage register/>
      </Route>
      <Route path='/chat' component={ChatPage} />
    </Router>
  );
}

export default App;
