import { ipcMain } from "electron";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { Theme } from "types/enums";
import UserData from "../structs/UserData";
import { Dictionary, Indexable } from "./dictionary";

class SettingsManager {
  // Settings, initalised at startup
  //Settings: {[key: string] : ({[key: string] : number | string | boolean} | number | string | boolean)};
  private Settings: Dictionary<number | string | boolean | Dictionary<number | string | boolean>>;
  private Operational: Dictionary<number | string | boolean>;

  // Userdata, initalised when users logs in
  UserData: UserData = new UserData();

  // App Constants
  readonly AppName: string = 'Nova Chat';
  readonly AppVersion: string = '3.0';
  readonly HomePath: string = '/login';
  readonly MessageCharacterLimit: number = 4000;

  // Operational
  CurrentChannel: string = '';
  IsFocused: boolean = true;
  CloseToTray: boolean = false;
  LoggedOut: boolean = false;

  constructor(webContents: Electron.WebContents, defaultSettings?: Dictionary<number | string | boolean | Dictionary<number | string | boolean>>) {
    if (existsSync('UserSettings.json')) {
      const d = Dictionary.fromJSON<number | string | boolean | Dictionary<number | string | boolean>>(readFileSync('UserSettings.json', { encoding: 'utf-8'}));
      if (d == undefined) this.Settings = new Dictionary<number | string | boolean | Dictionary<number | string | boolean>>(undefined, () => {webContents.send('SettingsUpdated'); });
      this.Settings = <Dictionary<number | string | boolean | Dictionary<number | string | boolean>>>d;
    }
    else if (defaultSettings != undefined)
      this.Settings = new Dictionary<number | string | boolean | Dictionary<number | string | boolean>>(defaultSettings, () => {webContents.send('SettingsUpdated'); });
    else
      this.Settings = new Dictionary<number | string | boolean | Dictionary<number | string | boolean>>(undefined, () => {webContents.send('SettingsUpdated'); });

    this.Operational = new Dictionary<number | string | boolean>(<Indexable<number | string | boolean>>{
      'CurrentChannel': '',
      'IsFocused': true,
      'CloseToTray': false,
      'LoggedOut': false
    });

    // Userdata
    ipcMain.handle('GetUserdata', () => JSON.stringify(this.UserData));
    ipcMain.on('SetUserdata', (_event, userData: string) => {
      console.log(userData);
      const obj = JSON.parse(userData);
      this.UserData = <UserData>obj;
      const store = Dictionary.fromJSON<string>(JSON.stringify(<Dictionary<string>>obj.keystore));;
      if (store != undefined)
        this.UserData.keystore = store;
      //console.log(this.UserData);
      webContents.send('UserdataUpdated', userData);
    });

    // Settings
    ipcMain.handle('GetSettings', () => JSON.stringify(this.Settings));
    ipcMain.on('SetSettings', (_event, settings: string) => {
      this.Settings = <Dictionary<number | string | boolean | Dictionary<number | string | boolean>>>JSON.parse(settings);
      this.Settings.OnUpdate = () => {webContents.send('SettingsUpdated'); };
    });

    // Constants
    ipcMain.handle('AppName', () => this.AppName);
    ipcMain.handle('AppVersion', () => this.AppVersion);
    ipcMain.handle('HomePath', () => this.HomePath);
    ipcMain.handle('MessageCharacterLimit', () => this.MessageCharacterLimit);

    // Operational
    ipcMain.handle('GetCurrentChannel', () => this.CurrentChannel)
    ipcMain.on('SetCurrentChannel', (_event, channel_uuid: string) => { this.CurrentChannel = channel_uuid; webContents.send('UpdateReady'); });

    ipcMain.handle('GetIsFocused', () => this.IsFocused)
    ipcMain.on('SetIsFocused', (_event, isFocused: boolean) => { this.IsFocused = isFocused; webContents.send('UpdateReady'); });

    ipcMain.handle('GetCloseTray', () => this.CloseToTray)
    ipcMain.on('SetCloseTray', (_event, closeToTray: boolean) => { this.CloseToTray = closeToTray; webContents.send('UpdateReady'); });

    ipcMain.handle('GetLoggedOut', () => this.LoggedOut)
    ipcMain.on('SetLoggedOut', (_event, loggedOut: boolean) => { this.LoggedOut = loggedOut; webContents.send('UpdateReady'); });

    // Save
    ipcMain.handle('Save', () => this.Save());

    ipcMain.on('ReadNumber', (event, key: string) => { event.returnValue = this.ReadNumber(key); });
    ipcMain.on('WriteNumber', (_event, key: string, value: number) => this.WriteSettingNumber(key, value));

    ipcMain.on('ReadString', (event, key: string) => { event.returnValue = this.ReadString(key); });
    ipcMain.on('WriteString', (_event, key: string, value: string) => this.WriteSettingString(key, value));

    ipcMain.on('ReadBoolean', (event, key: string) => { event.returnValue = this.ReadBoolean(key); });
    ipcMain.on('WriteBoolean', (_event, key: string, value: boolean) => this.WriteSettingBoolean(key, value));


    ipcMain.on('ReadTableNumber', (event, key: string, subkey: string) => { event.returnValue = this.ReadTableNumber(key, subkey); });
    ipcMain.on('WriteTableNumber', (_event, key: string, subKey:string, value: number) => this.WriteTableNumber(key, subKey, value));

    ipcMain.on('ReadTableString', (event, key: string, subkey: string) => { event.returnValue = this.ReadTableString(key, subkey); });
    ipcMain.on('WriteTableString', (_event, key: string, subKey:string, value: string) => this.WriteTableString(key, subKey, value));

    ipcMain.on('ReadTableBoolean', (event, key: string, subkey: string) => { event.returnValue = this.ReadTableBoolean(key, subkey); });
    ipcMain.on('WriteTableBoolean', (_event, key: string, subKey:string, value: boolean) => this.WriteTableBoolean(key, subKey, value));
  }

  // Settings
  // Read Functions
  ReadNumber(key: string) : number | undefined {
    if (typeof this.Settings.getValue(key) == 'number')
      return <number>this.Settings.getValue(key);
    return undefined;
  }
  ReadString(key: string) : string | undefined {
    if (typeof this.Settings.getValue(key) == 'string')
      return <string>this.Settings.getValue(key);
    return undefined;
  }
  ReadBoolean(key: string) : boolean | undefined {
    if (typeof this.Settings.getValue(key) == 'boolean')
      return <boolean>this.Settings.getValue(key);
    return undefined;
  }

  // Read Table Functions
  ReadTableNumber(key: string, subKey: string) : number | undefined {
    if (this.Settings.getValue(key) instanceof Dictionary) {
      const sub = (<Dictionary<number|string|boolean>>this.Settings.getValue(key));
      if (typeof sub.getValue(subKey)== 'number')
      return <number>sub.getValue(subKey);
    }
    return undefined;
  }
  ReadTableString(key: string, subKey: string) : string | undefined {
    if (this.Settings.getValue(key) instanceof Dictionary) {
      const sub = (<Dictionary<number|string|boolean>>this.Settings.getValue(key));
      if (typeof sub.getValue(subKey) == 'string')
      return <string>sub.getValue(subKey);
    }
    return undefined;
  }
  ReadTableBoolean(key: string, subKey: string) : boolean | undefined {
    if (this.Settings.getValue(key) instanceof Dictionary) {
      const sub = (<Dictionary<number|string|boolean>>this.Settings.getValue(key));
      if (typeof sub.getValue(subKey) == 'boolean')
      return <boolean>sub.getValue(subKey);
    }
    return undefined;
  }

  // Write Functions
  WriteSettingNumber(key: string, value: number) {
    this.Settings.setValue(key, value);
  }
  WriteSettingBoolean(key: string, value: boolean) {
    this.Settings.setValue(key, value);
  }
  WriteSettingString(key: string, value: string) {
    this.Settings.setValue(key, value);
  }

  // Write Table Functions
  WriteTableNumber(key: string, subKey: string, value: number) {
    if (!this.Settings.containsKey(key)) this.Settings.setValue(subKey, new Dictionary<number|string|boolean>());
    (<Dictionary<number|string|boolean>>this.Settings.getValue(key)).setValue(subKey, value);
  }
  WriteTableString(key: string, subKey: string, value: string) {
    if (this.Settings.getValue(key) == undefined) this.Settings.setValue(key, new Dictionary<number|string|boolean>());
    (<Dictionary<number|string|boolean>>this.Settings.getValue(key)).setValue(subKey, value);
  }
  WriteTableBoolean(key: string, subKey: string, value: boolean) {
    if (!this.Settings.containsKey(key)) this.Settings.setValue(subKey, new Dictionary<number|string|boolean>());
    (<Dictionary<number|string|boolean>>this.Settings.getValue(key)).setValue(subKey, value);
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

// eslint-disable-next-line import/no-mutable-exports
export let Manager: SettingsManager;
export function CreateManager(webContents: Electron.WebContents, defaultSettings?: Dictionary<number | string | boolean | Dictionary<number | string | boolean>>) {
  Manager = new SettingsManager(webContents, defaultSettings);
}
