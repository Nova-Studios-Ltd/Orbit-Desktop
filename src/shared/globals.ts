import UserData from '../structs/UserData';
import { Theme } from '../types/enums'

const GLOBALS = {
  userData: new UserData(undefined),
  currentChannel: '',
  HomePath: '/login',
  NotificationAssetPath: 'assets/sounds/bell.oga',
  MessageCharacterLimit: 4000,
  isFocused: true,
  theme: Theme.Dark,
  closeToTray: true,
  loggedOut: false
}

export default GLOBALS;
