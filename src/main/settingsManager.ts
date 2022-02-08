import { ipcMain } from "electron";
import { existsSync, readFileSync, writeFileSync } from "fs";
import UserData from "../structs/UserData";
import { Dictionary, DictionaryKeyChange, Indexable } from "./dictionary";

class SettingsManager {
  // Settings, initalised at startup
  //Settings: {[key: string] : ({[key: string] : number | string | boolean} | number | string | boolean)};
  private Settings: Dictionary<number | string | boolean | Dictionary<number | string | boolean>>;
  private Operational: Dictionary<number | string | boolean>;

  // Events for Settings
  private MainSettingsEvents: Dictionary<(key: string, value: number | string | boolean | Dictionary<number | string | boolean>, state: DictionaryKeyChange) => void> = new Dictionary<(key: string, value: number | string | boolean | Dictionary<number | string | boolean>, state: DictionaryKeyChange) => void>();
  private RenderSettingsEvents: Dictionary<(key: string, value: number | string | boolean | Dictionary<number | string | boolean>, state: DictionaryKeyChange) => void> = new Dictionary<(key: string, value: number | string | boolean | Dictionary<number | string | boolean>, state: DictionaryKeyChange) => void>();

  // Userdata, initalised when users logs in
  _UserData: UserData = new UserData();

  // App Constants
  readonly AppName: string = "Orbit";
  readonly AppVersion: string = "Alpha";
  readonly HomePath: string = "/login";
  readonly MessageCharacterLimit: number = 4000;

  // Other crap
  private readonly WebContents: Electron.WebContents;

  constructor(webContents: Electron.WebContents, defaultSettings?: Dictionary<number | string | boolean | Dictionary<number | string | boolean>>) {
    this.WebContents = webContents;
    if (existsSync("UserSettings.json")) {
      const d = Dictionary.fromJSON<number | string | boolean | Dictionary<number | string | boolean>>(readFileSync("UserSettings.json", { encoding: "utf-8"}));
      if (d == undefined) this.Settings = new Dictionary<number | string | boolean | Dictionary<number | string | boolean>>(undefined, this.SettingsUpdate);
      this.Settings = <Dictionary<number | string | boolean | Dictionary<number | string | boolean>>>d;
      this.Settings.OnUpdate = this.SettingsUpdate;
    }
    else if (defaultSettings != undefined)
      this.Settings = new Dictionary<number | string | boolean | Dictionary<number | string | boolean>>(defaultSettings, this.SettingsUpdate);
    else
      this.Settings = new Dictionary<number | string | boolean | Dictionary<number | string | boolean>>(undefined, this.SettingsUpdate);

    this.Operational = new Dictionary<number | string | boolean>(<Indexable<number | string | boolean>>{
      "CurrentChannel": "",
      "IsFocused": true,
      "CloseToTray": false,
      "LoggedOut": false
    });

    // Userdata
    ipcMain.handle("GetUserdata", () => JSON.stringify(this._UserData));
    ipcMain.on("SetUserdata", (_event, userData: string) => {
      const obj = JSON.parse(userData);
      this._UserData = <UserData>obj;
      const store = Dictionary.fromJSON<string>(JSON.stringify(<Dictionary<string>>obj.keystore));;
      if (store != undefined)
        this._UserData.keystore = store;
      webContents.send("UserdataUpdated", userData);
    });

    // Constants
    ipcMain.on("AppName", (event) => { event.returnValue = this.AppName; });
    ipcMain.on("AppVersion", (event) => { event.returnValue = this.AppVersion; });
    ipcMain.on("HomePath", (event) => { event.returnValue = this.HomePath; });
    ipcMain.on("MessageCharacterLimit", (event) => { event.returnValue = this.MessageCharacterLimit; });

    // Save
    ipcMain.handle("Save", () => this.SaveSettings());

    ipcMain.on("ReadSetting", (event, key: string) => { event.returnValue = this.ReadSetting(key); });
    ipcMain.on("WriteSetting", (_event, key: string, value: number | string | boolean) => this.WriteSetting(key, value));

    ipcMain.on("ReadSettingTable", (event, key: string, subKey: string) => { event.returnValue = this.ReadSettingTable(key, subKey); });
    ipcMain.on("WriteSettingTable", (_event, key: string, subKey: string, value: number | string | boolean) => this.WriteSettingTable(key, subKey, value));

    ipcMain.on("ReadConst", (event, key: string) => { event.returnValue = this.ReadConst(key); });
    ipcMain.on("WriteConst", (_event, key: string, value: string | boolean | number) => this.WriteConst(key, value));

    // Events
    ipcMain.on("OnSettingChanged", (_event, key: string) => this.IPCOnSettingChanged(key));
  }

  get UserData() : UserData {
    return this._UserData;
  }

  // Event
  private SettingsUpdate(key: string, value: number | string | boolean | Dictionary<number | string | boolean>, state: DictionaryKeyChange) {
    if (this.MainSettingsEvents.containsKey(key)) {
      this.MainSettingsEvents.getValue(key)(key, value, state);
    }
    if (this.RenderSettingsEvents.containsKey(key)) {
      this.RenderSettingsEvents.getValue(key)(key, value, state);
    }
    this.WebContents.send("SettingsUpdated");
  }

  private IPCOnSettingChanged(key: string) {
    this.RenderSettingsEvents.setValue(key, (k: string, value: number | string | boolean | Dictionary<number | string | boolean>, state: DictionaryKeyChange) => {
      this.WebContents.send(key, k, value, state);
    });
  }

  OnSettingChanged(key: string, func: (key: string, value: number | string | boolean | Dictionary<number | string | boolean>, state: DictionaryKeyChange) => void) {
    this.MainSettingsEvents.setValue(key, func);
  }

  // Settings
  ReadSetting<T>(key: string) : T {
    return <T><unknown>this.Settings.getValue(key);
  }

  ReadSettingTable<T>(key: string, subKey: string) : T | undefined {
    if (this.Settings.getValue(key) instanceof Dictionary) {
      const sub = (<Dictionary<number|string|boolean>>this.Settings.getValue(key));
      return <T><unknown>sub.getValue(subKey);
    }
    return undefined;
  }

  WriteSetting(key: string, value: number | string | boolean) {
    this.Settings.setValue(key, value);
  }

  WriteSettingTable(key: string, subKey: string, value: number | string | boolean) {
    if (!this.Settings.containsKey(key)) this.Settings.setValue(key, new Dictionary<number|string|boolean>());
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
      writeFileSync("UserSettings.json", JSON.stringify(this.Settings));
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
