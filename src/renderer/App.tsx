import React, { useRef } from 'react';
import { Router, Redirect, Route } from 'react-router-dom';
import './App.global.css';
import Login from './pages/Login';
import Chat from './pages/Chat';
import { history } from './helpers';
import './events';

function App() {
  const ChatRef = useRef();
  return (
    <Router history={history}>
      <Route path="/">
        <Redirect to="/login" />
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/chat">
        <Chat ref={ChatRef} />
      </Route>
    </Router>
  );
}

export default App;
