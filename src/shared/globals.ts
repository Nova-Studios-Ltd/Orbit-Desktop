import UserData from 'structs/UserData';
import { Theme } from 'types/enums'

const GLOBALS = {
  userData: new UserData(undefined),
  currentChannel: '',
  currentChannelName: '',
  HomePath: '/login',
  NotificationAssetPath: 'assets/sounds/bell.oga',
  isFocused: true,
  theme: Theme.Dark
}

export default GLOBALS;
