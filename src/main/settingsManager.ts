import { ipcMain } from "electron";
import { existsSync, readFileSync, writeFileSync } from "fs";
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
      webContents.send('UserdataUpdated', userData);
    });

    // Constants
    ipcMain.handle('AppName', () => this.AppName);
    ipcMain.handle('AppVersion', () => this.AppVersion);
    ipcMain.handle('HomePath', () => this.HomePath);
    ipcMain.handle('MessageCharacterLimit', () => this.MessageCharacterLimit);

    // Save
    ipcMain.handle('Save', () => this.SaveSettings());

    ipcMain.on('ReadSetting', (event, key: string) => { event.returnValue = this.ReadSetting(key); });
    ipcMain.on('WriteSetting', (_event, key: string, value: number | string | boolean) => this.WriteSetting(key, value));

    ipcMain.on('ReadSettingTable', (event, key: string, subKey: string) => { event.returnValue = this.ReadSettingTable(key, subKey); });
    ipcMain.on('WriteSettingTable', (_event, key: string, subKey: string, value: number | string | boolean) => this.WriteSettingTable(key, subKey, value));

    ipcMain.on('ReadConst', (event, key: string) => { event.returnValue = this.ReadConst(key); });
    ipcMain.on('WriteConst', (_event, key: string, value: string | boolean | number) => this.WriteConst(key, value));
  }

  // Settings
  ReadSetting<T>(key: string) : T {
    return <T><unknown>this.Settings.getValue(key);
  }

  ReadSettingTable<T>(key: string, subKey: string) : T | undefined {
    if (this.Settings.getValue(key) instanceof Dictionary) {
      const sub = (<Dictionary<number|string|boolean>>this.Settings.getValue(key));
      if (typeof sub.getValue(subKey)== 'number')
      return <T><unknown>sub.getValue(subKey);
    }
    return undefined;
  }

  WriteSetting(key: string, value: number | string | boolean) {
    this.Settings.setValue(key, value);
  }

  WriteSettingTable(key: string, subKey: string, value: number | string | boolean) {
    if (!this.Settings.containsKey(key)) this.Settings.setValue(subKey, new Dictionary<number|string|boolean>());
    (<Dictionary<number|string|boolean>>this.Settings.getValue(key)).setValue(subKey, value);
  }

  // Operational Constants
  ReadConst<T>(key: string) : T {
    return <T><unknown>this.Operational.getValue(key);
  }

  WriteConst(key: string, value: string | number | boolean) {
    this.Operational.setValue(key, value);
  }

  SaveSettings() : boolean {
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
