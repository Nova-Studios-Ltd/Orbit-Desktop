// Figure out how to store settings (e.g. json file)
// Decide whether or not to store/retrieve settings in memory or to just read/write straight to the file at all times
// Figure out how settings can be interfaced by the client

import { Debug, events, ipcRenderer } from 'shared/helpers';
import { LogContext, Theme } from 'types/enums';
import UserData from 'structs/UserData';

// Settings
/*

  - Theme
  - Notification Type
  - Accessibility options
    - Reduced motion/no animations

  Storage Method

  - JSON Format

*/

interface ISettingsKeySignature {
  [key: string]: string | boolean | number | Theme | UserData
}

interface ISettingsKeys extends ISettingsKeySignature {
  'NotificationAssetPath': string,
  'MessageCharacterLimit': number,
  'closeToTray': boolean,
  'Theme': Theme
}

class SettingsManager {
  Settings: ISettingsKeys;

  constructor() {
    this.Settings = {
      'NotificationAssetPath': 'assets/sounds/bell.oga',
      'MessageCharacterLimit': 4000,
      'closeToTray': true,
      'Theme': Theme.Dark
    } // Initialize defaults

    this.Init = this.Init.bind(this);
    this.SaveSetting = this.SaveSetting.bind(this);
    this.LoadSetting = this.LoadSetting.bind(this);
    this.SetSetting = this.SetSetting.bind(this);
    this.SetTheme = this.SetTheme.bind(this);
  }

  Init() {
    this.LoadSetting('Theme');
  }

  SaveSetting(key: string, value: string | boolean | number) {
    this.SetSetting(key, value);
    return ipcRenderer.invoke('saveSetting', key, value).then(() => { return true }, () => { return false });
  }

  LoadSetting(key: string) {
    ipcRenderer.invoke('retrieveSetting', key).then((value: string | boolean | number) => {
      if (value != null) {
        this.Settings[key] = value;
        Debug.Log(`Loaded setting ${key} with value ${String(this.Settings)}`, LogContext.Renderer);
      }
      else {
        this.SaveSetting(key, this.Settings[key])
      }
    });
  }

  SetSetting(key: string, value: string | boolean | number) {
    this.Settings[key] = value;
  }

  SetTheme(theme: Theme) {
    Debug.Log(`Changed theme to: ${theme}`, LogContext.Renderer);
    this.SaveSetting('Theme', theme);
    events.send('appThemeChanged', theme);
  }
}

export const Settings =  new SettingsManager();
