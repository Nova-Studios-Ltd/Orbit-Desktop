import React from 'react';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';
import './App.global.css';
import Login from './pages/Login';
import Chat from './pages/Chat';

export default function App() {
  return (
    <Router>
      <Route>
        <Redirect to="/login" />
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/chat" component={Chat} />
    </Router>
  );
}
