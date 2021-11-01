import React from 'react';
import { Router, Route } from 'react-router-dom';
import './App.global.css';
import AuthPage from 'renderer/pages/Auth';
import ChatPage from 'renderer/pages/Chat';
import { history, Navigate } from 'shared/helpers';
import './events';
import GLOBALS from 'shared/globals';
import { ToastContainer } from 'react-toastify';

Navigate(GLOBALS.HomePath, null);

function App() {
  return (
    <>
      <ToastContainer position='bottom-left'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
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
      </Router>
    </>
  );
}

export default App;
