import type { IpcRenderer } from "electron";
import { Dictionary } from "main/dictionary";
import { RSAMemoryKeyPair } from "main/encryptionClasses";
import UserData from "structs/UserData";
// eslint-disable-next-line import/no-cycle
import { Debug, ipcRenderer } from "./helpers";

export class SyncedUserData implements UserData {
  userData: UserData;

  constructor(userData?: UserData) {
    if (userData == undefined) this.userData = new UserData();
    else this.userData = userData;
    if (this.userData.keystore != undefined)
      this.userData.keystore.OnUpdate = () => this.SetUserdata();
    ipcRenderer.on('UserdataUpdated', (uData: string) =>
    {
      this.userData = <UserData>JSON.parse(uData);
      this.userData.keystore.OnUpdate = () => this.SetUserdata();
    });
  }

  // Getters/Setters
  get username() : string {
    return this.userData.username;
  }

  set username(v: string) {
    this.userData.username = v;
    this.SetUserdata();
  }

  get uuid() : string {
    return this.userData.uuid;
  }

  set uuid(v: string) {
    this.userData.uuid = v;
    this.SetUserdata();
  }

  get token() : string {
    return this.userData.token;
  }

  set token(v: string) {
    this.userData.token = v;
    this.SetUserdata();
  }

  get keyPair(): RSAMemoryKeyPair {
    return this.userData.keyPair;
  }

  set keyPair(v: RSAMemoryKeyPair) {
    this.userData.keyPair = v;
    this.SetUserdata();
  }

  get keystore(): Dictionary<string> {
    return this.userData.keystore;
  }

  set keystore(v: Dictionary<string>) {
    this.userData.keystore = v;
    this.userData.keystore.OnUpdate = () => this.SetUserdata();
    this.SetUserdata();
  }

  get discriminator(): string {
    return this.userData.discriminator;
  }

  set discriminator(v: string) {
    this.userData.discriminator = v;
    this.SetUserdata();
  }

  get avatarSrc(): string {
    return this.userData.avatarSrc;
  }

  set avatarSrc(v: string) {
    this.userData.avatarSrc = v;
    this.SetUserdata();
  }

  SetUserdata() {
    if (this.userData == undefined) return;
    ipcRenderer.send('SetUserdata', JSON.stringify(this.userData), JSON.stringify(this.userData.keystore));
  }
}

export class SettingsManager {
  // Constants
  private _AppName: string = '';
  private _AppVersion: string = '';
  private _HomePath: string = '';

  // Operational
  private _CurrentChannel: string = '';
  private _IsFocused: boolean = true;
  private _CloseToTray: boolean = false;
  private _LoggedOut: boolean = false;

  private _UserData: SyncedUserData = new SyncedUserData(undefined);
  private Settings: Dictionary<number | string | boolean | Dictionary<number | string | boolean>>;

  onReady: () => void;

  constructor() {
    this.Settings = new Dictionary<number | string | boolean | Dictionary<number | string | boolean>>();
    this.Update();

    this.onReady = () => {};

    ipcRenderer.on('UpdateReady', this.Update);
    ipcRenderer.on('SettingsUpdated', () => {
      ipcRenderer.invoke('GetSettings').then((v: string) => {
        this.Settings = <Dictionary<number | string | boolean | Dictionary<number | string | boolean>>>JSON.parse(v);
        this.Settings.OnUpdate = () => {ipcRenderer.send('SetSettings', JSON.stringify(this.Settings)); }
      });
    });

    // Userdata and Settings manage themselves
    ipcRenderer.invoke('GetUserdata').then((v: string) => {
      //this._UserData = new SyncedUserData(<UserData>JSON.parse(v));
      console.log(v);
      this._UserData = new SyncedUserData(Object.assign(new UserData(), v));
    });

    ipcRenderer.invoke('GetSettings').then((v: string) => {
      this.Settings = <Dictionary<number | string | boolean | Dictionary<number | string | boolean>>>JSON.parse(v);
      this.Settings.OnUpdate = () => {ipcRenderer.send('SetSettings', JSON.stringify(this.Settings)); }
    });
  }

  updates: number = 0;

  private Update() {
    // Constants
    ipcRenderer.invoke('AppName').then((v: string) => {
      this._AppName = v;
      this.updates++;
      if (this.updates >= 7) {
        this.onReady();
        this.onReady = () => {};
      }
    });
    ipcRenderer.invoke('AppVersion').then((v: string) => {
      this._AppVersion = v;
      this.updates++;
      if (this.updates >= 7) {
        this.onReady();
        this.onReady = () => {};
      }
    });
    ipcRenderer.invoke('HomePath').then((v: string) => {
      this._HomePath = v;
      this.updates++;
      if (this.updates >= 7) {
        this.onReady();
        this.onReady = () => {};
      }
    });

    // Operational
    ipcRenderer.invoke('GetCurrentChannel').then((v: string) => {
      this._CurrentChannel = v;
      this.updates++;
      if (this.updates >= 7) {
        this.onReady();
        this.onReady = () => {};
      }
    });
    ipcRenderer.invoke('GetIsFocused').then((v: boolean) => {
      this._IsFocused = v;
      this.updates++;
      if (this.updates >= 7) {
        this.onReady();
        this.onReady = () => {};
      }
    });
    ipcRenderer.invoke('GetCloseTray').then((v: boolean) => {
      this._CloseToTray = v;
      this.updates++;
      if (this.updates >= 7) {
        this.onReady();
        this.onReady = () => {};
      }
    });
    ipcRenderer.invoke('GetLoggedOut').then((v: boolean) => {
      this._LoggedOut = v;
      this.updates++;
      if (this.updates >= 7) {
        this.onReady();
        this.onReady = () => {};
      }
    });
  }

  get AppName() { return this._AppName; }
  get AppVersion() { return this._AppVersion; }
  get HomePath() { return this._HomePath; }
  get UserData() { return this._UserData; }

  get CurrentChannel() { return this._CurrentChannel; }
  set CurrentChannel(v: string) {
    this._CurrentChannel = v;
    ipcRenderer.send('SetCurrentChannel', v);
  }

  get IsFocused() { return this._IsFocused; }
  set IsFocused(v: boolean) {
    this._IsFocused = v;
    ipcRenderer.send('SetIsFocused', v);
  }

  get CloseToTray() { return this._CloseToTray; }
  set CloseToTray(v: boolean) {
    this._CloseToTray = v;
    ipcRenderer.send('SetCloseToTray', v);
  }

  get LoggedOut() { return this._LoggedOut; }
  set LoggedOut(v: boolean) {
    this._LoggedOut = v;
    ipcRenderer.send('SetLoggedOut', v);
  }


  // Settings
  // Read Functions
  ReadNumber(key: string) : number | undefined {
    return ipcRenderer.sendSync('ReadNumber', key);
  }
  ReadString(key: string) : string | undefined {
    return ipcRenderer.sendSync('ReadString', key);
  }
  ReadBoolean(key: string) : boolean | undefined {
    return ipcRenderer.sendSync('ReadBoolean', key);
  }

  // Read Table Functions
  ReadTableNumber(key: string, subKey: string) : number | undefined {
    return ipcRenderer.sendSync('ReadTableNumber', key, subKey);
  }
  ReadTableString(key: string, subKey: string) : string | undefined {
    return ipcRenderer.sendSync('ReadTableString', key, subKey);
  }
  ReadTableBoolean(key: string, subKey: string) : boolean | undefined {
    return ipcRenderer.sendSync('ReadTableBoolean', key, subKey);
  }

  // Write Functions
  WriteNumber(key: string, value: number) {
    ipcRenderer.send('WriteNumber', key, value);
  }
  WriteBoolean(key: string, value: boolean) {
    ipcRenderer.send('WriteNumber', key, value);
  }
  WriteString(key: string, value: string) {
    ipcRenderer.send('WriteNumber', key, value);
  }

  // Write Table Functions
  WriteTableNumber(key: string, subKey: string, value: number) {
    ipcRenderer.send('WriteTableNumber', key, subKey, value);
  }
  WriteTableString(key: string, subKey: string, value: string) {
    ipcRenderer.send('WriteTableString', key, subKey, value);
  }
  WriteTableBoolean(key: string, subKey: string, value: boolean) {
    ipcRenderer.send('WriteTableBoolean', key, subKey, value);
  }

  async Save() : Promise<boolean> {
    const v = await ipcRenderer.invoke('Save');
    return v;
  }
}
