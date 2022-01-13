import type { IpcRenderer } from "electron";
import UserData from "structs/UserData";

export class SettingsManager {
  IPC: IpcRenderer;

  _AppName?: string;
  _AppVersion?: string;
  _HomePath?: string;

  get AppName() : string | undefined {return this._AppName};
  get AppVersion() : string | undefined {return this._AppVersion};
  get HomePath() : string | undefined {return this._HomePath};

  constructor(ipc: IpcRenderer) {
    this.IPC = ipc;

    this.IPC.invoke('AppName').then((result: string) => { this._AppName = result});
    this.IPC.invoke('AppVersion').then((result: string) => { this._AppVersion = result});
    this.IPC.invoke('HomePath').then((result: string) => { this._HomePath = result});
  }

  // Operational
  async GetCurrentChannel(): Promise<string> {
    const v = await this.IPC.invoke('GetCurrentChannel');
    return v;
  }
  SetCurrentChannel(channel_uuid: string): void {
    this.IPC.send('SetCurrentChannel', channel_uuid);
  }

  async GetIsFocused(): Promise<boolean> {
    const v = await this.IPC.invoke('GetIsFocused');
    return v;
  }
  SetIsFocused(isFocused: boolean): void {
    this.IPC.send('SetIsFocused', isFocused);
  }

  async GetCloseTray(): Promise<boolean> {
    const v = await this.IPC.invoke('GetCloseTray');
    return v;
  }
  SetCloseTray(closeTray: boolean): void {
    this.IPC.send('SetCloseTray', closeTray);
  }

  async GetLoggedOut(): Promise<boolean> {
    const v = await this.IPC.invoke('GetLoggedOut');
    return v;
  }
  SetLoggedOut(loggedOut: boolean): void {
    this.IPC.send('SetLoggedOut', loggedOut);
  }

  // Userdata
  async GetUserdata() : Promise<UserData> {
    const v = await this.IPC.invoke('GetUserdata');
    return v;
  }
  SetUserdata(userData: UserData): void {
    this.IPC.send('SetUserdata', userData);
  }

  // Settings
  // Read Functions
  async ReadNumber(key: string) : Promise<number | undefined> {
    const v = await this.IPC.invoke('ReadNumber', key);
    return v;
  }
  async ReadString(key: string) : Promise<string | undefined> {
    const v = await this.IPC.invoke('ReadString', key);
    return v;
  }
  async ReadBoolean(key: string) : Promise<boolean | undefined> {
    const v = await this.IPC.invoke('ReadBoolean', key);
    return v;
  }

  // Read Table Functions
  async ReadTableNumber(key: string, subKey: string) : Promise<number | undefined> {
    const v = await this.IPC.invoke('ReadTableNumber', key, subKey);
    return v;
  }
  async ReadTableString(key: string, subKey: string) : Promise<string | undefined> {
    const v = await this.IPC.invoke('ReadTableString', key, subKey);
    return v;
  }
  async ReadTableBoolean(key: string, subKey: string) : Promise<boolean | undefined> {
    const v = await this.IPC.invoke('ReadTableString', key, subKey);
    return v;
  }

  // Write Functions
  WriteNumber(key: string, value: number) {
    this.IPC.send('WriteNumber', key, value);
  }
  WriteBoolean(key: string, value: boolean) {
    this.IPC.send('WriteBoolean', key, value);
  }
  WriteString(key: string, value: string) {
    this.IPC.send('WriteString', key, value);
  }

  // Write Table Functions
  WriteTableNumber(key: string, subKey: string, value: number) {
    this.IPC.send('WriteTableNumber', key, subKey, value);
  }
  WriteTableString(key: string, subKey: string, value: string) {
    this.IPC.send('WriteTableString', key, subKey, value);
  }
  WriteTableBoolean(key: string, subKey: string, value: boolean) {
    this.IPC.send('WriteTableBoolean', key, subKey, value);
  }

  async Save() : Promise<boolean> {
    const v = await this.IPC.invoke('Save');
    return v;
  }
}
