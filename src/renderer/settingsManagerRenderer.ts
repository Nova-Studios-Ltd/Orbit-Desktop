import { Dictionary, DictionaryKeyChange } from "shared/dictionary";
import { RSAMemoryKeyPair } from "shared/encryptionClasses";
// eslint-disable-next-line import/no-cycle
import { ipcRenderer } from "renderer/helpers";

import UserData from "structs/UserData";

export class SyncedUserData {
  UserData: UserData;
  DontUpdate: boolean = false;

  constructor(userData?: UserData) {
    if (userData == undefined) this.UserData = new UserData();
    else this.UserData = userData;
    if (this.UserData.keystore != undefined)
      this.UserData.keystore.OnUpdate = () => this.SetUserdata();
    ipcRenderer.on("UserdataUpdated", (uData: string) =>
    {
      const obj = JSON.parse(uData);
      this.UserData = <UserData>obj;
      const store = Dictionary.fromJSON<string>(JSON.stringify(obj.keystore));;
      if (store != undefined)
        this.UserData.keystore = store;
      this.UserData.keystore.OnUpdate = () => this.SetUserdata();
    });
  }

  Update() {
    this.DontUpdate = false;
    this.SetUserdata();
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
    if (this.UserData == undefined || this.DontUpdate) return;
    ipcRenderer.send("SetUserdata", JSON.stringify(this.UserData));
  }
}

export class SettingsManager {
  // Constants
  private _AppName: string = "";
  private _AppVersion: string = "";
  private _HomePath: string = "";
  private _MessageCharacterLimit: number = 0;

  private _UserData: SyncedUserData = new SyncedUserData(undefined);

  onReady: () => void;

  constructor() {
    this.onReady = () => {};

    this._AppName = ipcRenderer.sendSync("AppName");
    this._AppVersion = ipcRenderer.sendSync("AppVersion");
    this._HomePath = ipcRenderer.sendSync("HomePath");
    this._MessageCharacterLimit = ipcRenderer.sendSync("MessageCharacterLimit");

    // Userdata manages itself
    ipcRenderer.invoke("GetUserdata").then((v: string) => {
      const obj = JSON.parse(v);
      const uData = <UserData>obj;
      const store = Dictionary.fromJSON<string>(JSON.stringify(obj.keystore));;
      if (store != undefined)
        uData.keystore = store;

      this._UserData = new SyncedUserData(uData);
      this.onReady();
    });
  }

  get AppName() { return this._AppName; }
  get AppVersion() { return this._AppVersion; }
  get HomePath() { return this._HomePath; }
  get MessageCharacterLimit() { return this._MessageCharacterLimit; }
  get UserData() { return this._UserData; }

  OnSettingChanged(key: string, func: (key: string, value: number | string | boolean | Dictionary<number | string | boolean>, state: DictionaryKeyChange) => void) {
    ipcRenderer.send("OnSettingChanged", key);
    ipcRenderer.on(key, func);
  }

  // Settings
  ReadSetting<T>(key: string) : T {
    return <T>ipcRenderer.sendSync("ReadSetting", key);
  }

  ReadSettingTable<T>(key: string, subKey: string) : T | undefined {
    return ipcRenderer.sendSync("ReadSettingTable", key, subKey);
  }

  WriteSetting(key: string, value: number | string | boolean) {
    ipcRenderer.send("WriteSetting", key, value);
  }

  WriteSettingTable(key: string, subKey: string, value: number | string | boolean) {
    ipcRenderer.send("WriteSettingTable", key, subKey, value);
  }

  // Constants
  ReadConst<T>(key: string) : T {
    return <T>ipcRenderer.sendSync("ReadConst", key);
  }

  WriteConst(key: string, value: string | number | boolean) {
    ipcRenderer.send("WriteConst", key, value);
  }

  async Save() : Promise<boolean> {
    const v = await ipcRenderer.invoke("Save");
    return v;
  }
}
