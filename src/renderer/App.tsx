import React from 'react';
import { Router, Redirect, Route } from 'react-router-dom';
import './App.global.css';
import Login from './pages/Login';
import Chat from './pages/Chat';
import { history } from './RendererHelperFunctions';

function App() {
  return (
    <Router history={history}>
      <Route path="/">
        <Redirect to="/login" />
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/chat" component={Chat} />
    </Router>
  );
}

export default App;
