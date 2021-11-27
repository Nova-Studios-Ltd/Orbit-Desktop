import UserData from '../structs/UserData';

const GLOBALS = {
  userData: new UserData(null),
  currentChannel: '',
  HomePath: '/login',
  NotificationAssetPath: 'assets/sounds/bell.oga',
  isFocused: true
}

export default GLOBALS;
