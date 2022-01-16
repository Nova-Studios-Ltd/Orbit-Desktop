import { Dictionary } from "main/dictionary";
import { RSAMemoryKeyPair } from "main/encryptionClasses";
import UserData from "structs/UserData";
// eslint-disable-next-line import/no-cycle
import { ipcRenderer } from "./helpers";

export class SyncedUserData {
  UserData: UserData;

  constructor(userData?: UserData) {
    if (userData == undefined) this.UserData = new UserData();
    else this.UserData = userData;
    if (this.UserData.keystore != undefined)
      this.UserData.keystore.OnUpdate = () => this.SetUserdata();
    ipcRenderer.on('UserdataUpdated', (uData: string) =>
    {
      const obj = JSON.parse(uData);
      this.UserData = <UserData>obj;
      const store = Dictionary.fromJSON<string>(JSON.stringify(obj.keystore));;
      if (store != undefined)
        this.UserData.keystore = store;
      console.log(this.UserData);
      this.UserData.keystore.OnUpdate = () => this.SetUserdata();
    });
  }

  // Getters/Setters
  get username() : string {
    return this.UserData.username;
  }

  set username(v: string) {
    this.UserData.username = v;
    this.SetUserdata();
  }

  get uuid() : string {
    return this.UserData.uuid;
  }

  set uuid(v: string) {
    this.UserData.uuid = v;
    this.SetUserdata();
  }

  get token() : string {
    return this.UserData.token;
  }

  set token(v: string) {
    this.UserData.token = v;
    this.SetUserdata();
  }

  get keyPair(): RSAMemoryKeyPair {
    return this.UserData.keyPair;
  }

  set keyPair(v: RSAMemoryKeyPair) {
    this.UserData.keyPair = v;
    this.SetUserdata();
  }

  get keystore(): Dictionary<string> {
    return this.UserData.keystore;
  }

  set keystore(v: Dictionary<string>) {
    console.log(v);
    this.UserData.keystore = v;
    this.UserData.keystore.OnUpdate = () => this.SetUserdata();
    this.SetUserdata();
  }

  get discriminator(): string {
    return this.UserData.discriminator;
  }

  set discriminator(v: string) {
    this.UserData.discriminator = v;
    this.SetUserdata();
  }

  get avatarSrc(): string {
    return this.UserData.avatarSrc;
  }

  set avatarSrc(v: string) {
    this.UserData.avatarSrc = v;
    this.SetUserdata();
  }

  SetUserdata() {
    if (this.UserData == undefined) return;
    ipcRenderer.send('SetUserdata', JSON.stringify(this.UserData));
    console.log(JSON.stringify(this.UserData));
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

      const obj = JSON.parse(v);
      const uData = <UserData>obj;
      const store = Dictionary.fromJSON<string>(JSON.stringify(obj.keystore));;
      if (store != undefined)
        uData.keystore = store;
      console.log(uData);

      this._UserData = new SyncedUserData(uData);
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
