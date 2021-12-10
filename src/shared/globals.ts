import UserData from '../structs/UserData';
import { Theme } from '../types/enums'

const GLOBALS = {
  userData: new UserData(undefined),
  currentChannel: '',
  currentChannelName: '',
  HomePath: '/login',
  NotificationAssetPath: 'assets/sounds/bell.oga',
  MessageCharacterLimit: 4000,
  isFocused: true,
  closeToTray: true
}

export default GLOBALS;
