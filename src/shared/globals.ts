import UserData from '../structs/UserData';

const GLOBALS = {
  userData: new UserData(undefined),
  appName: 'Nova Chat',
  appVersion: '3.0',
  currentChannel: '',
  HomePath: '/login',
  isFocused: true,
}

export default GLOBALS;
