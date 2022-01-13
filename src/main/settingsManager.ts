import { ipcMain } from "electron";
import { existsSync, readFileSync, writeFileSync } from "fs";
import UserData from "structs/UserData";
import { Dictionary } from "./dictionary";

export class SettingsManager {
  // Settings, initalised at startup
  //Settings: {[key: string] : ({[key: string] : number | string | boolean} | number | string | boolean)};
  private Settings: Dictionary<number | string | boolean | Dictionary<number | string | boolean>>;

  // Userdata, initalised when users logs in
  UserData?: UserData = undefined;

  // App Constants
  readonly AppName: string = 'Nova Chat';
  readonly AppVersion: string = '3.0';
  readonly HomePath: string = '/login';

  // Operational
  CurrentChannel: string = '';
  IsFocused: boolean = true;
  CloseToTray: boolean = false;
  LoggedOut: boolean = false;

  constructor() {
    if (existsSync('UserSettings.json'))
      this.Settings = JSON.parse(readFileSync('UserSettings.json', { encoding: 'utf-8'}));
    else
      this.Settings = new Dictionary<number|string|boolean>();

    // Settings
    // Read Events
    ipcMain.handle('ReadNumber', (_event, key: string) => this.ReadNumber(key));
    ipcMain.handle('ReadString', (_event, key: string) => this.ReadString(key));
    ipcMain.handle('ReadBoolean', (_event, key: string) => this.ReadBoolean(key));

    // Read Table Events
    ipcMain.handle('ReadTableNumber', (_event, key: string, subKey: string) => this.ReadTableNumber(key, subKey));
    ipcMain.handle('ReadTableString', (_event, key: string, subKey: string) => this.ReadTableString(key, subKey));
    ipcMain.handle('ReadTableBoolean', (_event, key: string, subKey: string) => this.ReadTableBoolean(key, subKey));

    // Write Events
    ipcMain.on('WriteNumber', (_event, key: string, value: number) => this.WriteNumber(key, value));
    ipcMain.on('WriteString', (_event, key: string, value: string) => this.WriteString(key, value));
    ipcMain.on('WriteBoolean', (_event, key: string, value: boolean) => this.WriteBoolean(key, value));

    // Write Table Events
    ipcMain.on('WriteTableNumber', (_event, key: string, subKey: string, value: number) => this.WriteTableNumber(key, subKey, value));
    ipcMain.on('WriteTableString', (_event, key: string, subKey: string, value: string) => this.WriteTableString(key, subKey, value));
    ipcMain.on('WriteTableBoolean', (_event, key: string, subKey: string, value: boolean) => this.WriteTableBoolean(key, subKey, value));

    // Userdata
    ipcMain.handle('GetUserdata', () => this.UserData)
    ipcMain.on('SetUserdata', (_event, userData: UserData) => { this.UserData = userData; })

    // Constants
    ipcMain.handle('AppName', () => this.AppName);
    ipcMain.handle('AppVersion', () => this.AppVersion);
    ipcMain.handle('HomePath', () => this.HomePath);

    // Operational
    ipcMain.handle('GetCurrentChannel', () => this.CurrentChannel)
    ipcMain.on('SetCurrentChannel', (_event, channel_uuid: string) => { this.CurrentChannel = channel_uuid; })

    ipcMain.handle('GetIsFocused', () => this.IsFocused)
    ipcMain.on('SetIsFocused', (_event, isFocused: boolean) => { this.IsFocused = isFocused; })

    ipcMain.handle('GetCloseTray', () => this.CloseToTray)
    ipcMain.on('SetCloseTray', (_event, closeToTray: boolean) => { this.CloseToTray = closeToTray; })

    ipcMain.handle('GetLoggedOut', () => this.LoggedOut)
    ipcMain.on('SetLoggedOUt', (_event, loggedOut: boolean) => { this.LoggedOut = loggedOut; })

    // Save
    ipcMain.on('Save', () => this.Save());
  }

  // Settings
  // Read Functions
  ReadNumber(key: string) : number | undefined {
    if (typeof this.Settings.get(key) == 'number')
      return <number>this.Settings.get(key);
    return undefined;
  }
  ReadString(key: string) : string | undefined {
    if (typeof this.Settings.get(key) == 'string')
      return <string>this.Settings.get(key);
    return undefined;
  }
  ReadBoolean(key: string) : boolean | undefined {
    if (typeof this.Settings.get(key) == 'boolean')
      return <boolean>this.Settings.get(key);
    return undefined;
  }

  // Read Table Functions
  ReadTableNumber(key: string, subKey: string) : number | undefined {
    if (this.Settings.get(key) instanceof Dictionary) {
      const sub = (<Dictionary<number|string|boolean>>this.Settings.get(key));
      if (typeof sub.get(subKey)== 'number')
      return <number>sub.get(subKey);
    }
    return undefined;
  }
  ReadTableString(key: string, subKey: string) : string | undefined {
    if (this.Settings.get(key) instanceof Dictionary) {
      const sub = (<Dictionary<number|string|boolean>>this.Settings.get(key));
      if (typeof sub.get(subKey) == 'string')
      return <string>sub.get(subKey);
    }
    return undefined;
  }
  ReadTableBoolean(key: string, subKey: string) : boolean | undefined {
    if (this.Settings.get(key) instanceof Dictionary) {
      const sub = (<Dictionary<number|string|boolean>>this.Settings.get(key));
      if (typeof sub.get(subKey) == 'boolean')
      return <boolean>sub.get(subKey);
    }
    return undefined;
  }

  // Write Functions
  WriteNumber(key: string, value: number) {
    this.Settings.set(key, value);
  }
  WriteBoolean(key: string, value: boolean) {
    this.Settings.set(key, value);
  }
  WriteString(key: string, value: string) {
    this.Settings.set(key, value);
  }

  // Write Table Functions
  WriteTableNumber(key: string, subKey: string, value: number) {
    if (!this.Settings.containsKey(key)) this.Settings.set(subKey, new Dictionary<number|string|boolean>());
    (<Dictionary<number|string|boolean>>this.Settings.get(key)).set(subKey, value);
  }
  WriteTableString(key: string, subKey: string, value: string) {
    if (this.Settings.get(key) == undefined) this.Settings.set(key, new Dictionary<number|string|boolean>());
    (<Dictionary<number|string|boolean>>this.Settings.get(key)).set(subKey, value);
  }
  WriteTableBoolean(key: string, subKey: string, value: boolean) {
    if (!this.Settings.containsKey(key)) this.Settings.set(subKey, new Dictionary<number|string|boolean>());
    (<Dictionary<number|string|boolean>>this.Settings.get(key)).set(subKey, value);
  }

  Save() : boolean {
    try {
      writeFileSync('UserSettings.json', JSON.stringify(this.Settings));
      return true;
    }
    catch {
      return false;
    }
  }
}

export const Manager = new SettingsManager();
