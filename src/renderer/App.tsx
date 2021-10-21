import React from 'react';
import { Router, Redirect, Route } from 'react-router-dom';
import 'renderer/App.global.css';
import AuthPage from 'renderer/pages/Auth';
import ChatPage from 'renderer/pages/Chat';
import { history } from 'renderer/helpers';
import 'renderer/events';

function App() {
  return (
    <Router history={history}>
      <Route exact path={["/", "/index", "/index.html"]}>
        <Redirect to="/login" />
      </Route>
      <Route path="/login">
        <AuthPage login/>
      </Route>
      <Route path="/register">
        <AuthPage register/>
      </Route>
      <Route path="/chat" component={ChatPage} />
    </Router>
  );
}

export default App;
