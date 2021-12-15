import UserData from '../structs/UserData';
import { Theme } from '../types/enums'

const GLOBALS = {
  userData: new UserData(undefined),
  appName: 'Nova Chat',
  appVersion: '3.0',
  currentChannel: '',
  HomePath: '/login',
  NotificationAssetPath: 'assets/sounds/bell.oga',
  MessageCharacterLimit: 4000,
  isFocused: true,
  closeToTray: true
}

export default GLOBALS;
