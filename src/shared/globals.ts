import UserData from '../structs/UserData';

const GLOBALS = {
  userData: new UserData(undefined),
  appName: 'Eden',
  appVersion: '3.0',
  currentChannel: '',
  HomePath: '/login',
  isFocused: true,
  closeToTray: false,
  loggedOut: false
}

export default GLOBALS;
