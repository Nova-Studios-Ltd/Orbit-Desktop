import { ipcMain } from "electron";
import { existsSync, readFileSync } from "fs";
import UserData from "structs/UserData";
import { Dictionary } from "./dictionary";

export class SettingsManager {
  // Settings, initalised at startup
  //Settings: {[key: string] : ({[key: string] : number | string | boolean} | number | string | boolean)};
  Settings: Dictionary<number | string | boolean | Dictionary<number | string | boolean>>;

  // Userdata, initalised when users logs in
  UserData?: UserData = undefined;

  // App Constants
  AppName: string = 'Nova Chat';
  AppVersion: string = '3.0';
  HomePath: string = '/login';

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

    // Read Events
    ipcMain.handle('ReadNumber', (_event, key: string) => this.ReadNumber(key));
    ipcMain.handle('ReadString', (_event, key: string) => this.ReadString(key));
    ipcMain.handle('ReadBoolean', (_event, key: string) => this.ReadBoolean(key));

    // Read Table Events
    ipcMain.handle('ReadTableNumber', (_event, key: string, subKey: string) => this.ReadTableNumber(key, subKey));
    ipcMain.handle('ReadTableString', (_event, key: string, subKey: string) => this.ReadTableString(key, subKey));
    ipcMain.handle('ReadTableBoolean', (_event, key: string, subKey: string) => this.ReadTableBoolean(key, subKey));

    // Write Events
    ipcMain.handle('WriteNumber', (_event, key: string, value: number) => this.WriteNumber(key, value));
    ipcMain.handle('WriteString', (_event, key: string, value: string) => this.WriteString(key, value));
    ipcMain.handle('WriteBoolean', (_event, key: string, value: boolean) => this.WriteBoolean(key, value));

    // Write Table Events
    ipcMain.handle('WriteTableNumber', (_event, key: string, subKey: string, value: number) => this.WriteTableNumber(key, subKey, value));
    ipcMain.handle('WriteTableString', (_event, key: string, subKey: string, value: string) => this.WriteTableString(key, subKey, value));
    ipcMain.handle('WriteTableBoolean', (_event, key: string, subKey: string, value: boolean) => this.WriteTableBoolean(key, subKey, value));
  }

  // Read Functions
  ReadNumber(key: string) : number | undefined {
    if (typeof this.Settings[key] == 'number')
      return <number>this.Settings[key];
    return undefined;
  }

  ReadString(key: string) : string | undefined {
    if (typeof this.Settings[key] == 'string')
      return <string>this.Settings[key];
    return undefined;
  }

  ReadBoolean(key: string) : boolean | undefined {
    if (typeof this.Settings[key] == 'boolean')
      return <boolean>this.Settings[key];
    return undefined;
  }

  // Read Table Functions
  ReadTableNumber(key: string, subKey: string) : number | undefined {
    if (this.Settings[key] instanceof Dictionary) {
      const sub = (<Dictionary<number|string|boolean>>this.Settings[key]);
      if (typeof sub[subKey] == 'number')
      return <number>sub[subKey];
    }
    return undefined;
  }

  ReadTableString(key: string, subKey: string) : string | undefined {
    if (this.Settings[key] instanceof Dictionary) {
      const sub = (<Dictionary<number|string|boolean>>this.Settings[key]);
      if (typeof sub[subKey] == 'string')
      return <string>sub[subKey];
    }
    return undefined;
  }

  ReadTableBoolean(key: string, subKey: string) : boolean | undefined {
    if (this.Settings[key] instanceof Dictionary) {
      const sub = (<Dictionary<number|string|boolean>>this.Settings[key]);
      if (typeof sub[subKey] == 'boolean')
      return <boolean>sub[subKey];
    }
    return undefined;
  }

  // Write Functions
  WriteNumber(key: string, value: number) {
    this.Settings[key] = value;
  }

  WriteBoolean(key: string, value: boolean) {
    this.Settings[key] = value;
  }

  WriteString(key: string, value: string) {
    this.Settings[key] = value;
  }

  // Write Table Functions
  WriteTableNumber(key: string, subKey: string, value: number) {
    if (this.Settings[key] == undefined) this.Settings[key] = new Dictionary<number|string|boolean>();
    (<Dictionary<number|string|boolean>>this.Settings[key])[subKey] = value;
  }

  WriteTableString(key: string, subKey: string, value: string) {
    if (this.Settings[key] == undefined) this.Settings[key] = new Dictionary<number|string|boolean>();
    (<Dictionary<number|string|boolean>>this.Settings[key])[subKey] = value;
  }

  WriteTableBoolean(key: string, subKey: string, value: boolean) {
    if (this.Settings[key] == undefined) this.Settings[key] = new Dictionary<number|string|boolean>();
    (<Dictionary<number|string|boolean>>this.Settings[key])[subKey] = value;
  }

  Dump() : string {
    return JSON.stringify(this.Settings);
  }
}
