import React from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import Login from './pages/Login';
import Chat from './pages/Chat';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Login} />
      </Switch>
      <Route path="/chat" component={Chat} />
    </Router>
  );
}
