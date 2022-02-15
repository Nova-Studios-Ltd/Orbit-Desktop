import { createBrowserHistory } from "history";
import Credentials from "structs/Credentials";
import { UIEvents } from "renderer/UIEvents";
import { DebugLogger } from "renderer/debugRenderer";
import { IElectronRendererWindow } from "types/types";
import IUser from "types/types";
import { SettingsManager } from "./settingsManagerRenderer";
import { Dictionary } from "main/dictionary";
import { RSAMemoryKeyPair } from "main/encryptionClasses";

export const history = createBrowserHistory();
export const {ipcRenderer}: IElectronRendererWindow = window.electron;
export const events = new UIEvents();
export const Manager = new SettingsManager();
export const Debug = new DebugLogger(ipcRenderer);

export function Navigate(path: string, data: unknown)
{
  try {
    history.push(path, data);
    Debug.Success(`Navigated to ${path}`);
  }
  catch (error: unknown) {
    Debug.Error(`Unable to navigate to path ${path}`, (<Error>error).message)
  }
}

export function GetHistoryState() {
  return history.location.state as { failed: boolean };
}

let reconnectAttempts = 1;
let reconnect: NodeJS.Timeout;
const timestepStates = [2500, 4000, 8000, 12000]
export async function HandleWebsocket() {
  const userData = Manager.UserData;
  const {token} = userData;
  const {uuid} = userData;
  const socket = new WebSocket(`wss://api.novastudios.tk/Events/Listen?user_uuid=${uuid}`)
  socket.onmessage = async (data) => {
    const event = JSON.parse(data.data);
    switch (event.EventType) {
      case -1:
        console.log("<Beat>");
        //socket.send("<Beep>")
        break;
      case 0: {
        const message = await ipcRenderer.invoke("GETMessage", event.Channel, event.Message);
        if (message == undefined) break;
        events.send("OnNewMessage", message, event.Channel);
        break;
      }
      case 1:
        events.send("OnMessageDelete", event.Channel, event.Message);
        break;
      case 2: {
        const message = await ipcRenderer.invoke("GETMessage", event.Channel, event.Message);
        if (message == undefined) break;
        events.send("OnMessageEdit", message, event.Channel, event.Message);
        break;
      }
      case 3:
        events.send("OnChannelCreated", event.Channel);
        break;
      case 4:
        events.send("OnChannelDeleted", event.Channel);
        break;
      case 5:
        break;
      case 6:
        events.send("OnChannelNewMember", event.Channel);
        break;
      case 7: { // New key in keystore
        const key = await ipcRenderer.invoke("GETKey", userData.uuid, event.keyUserUUID);
        userData.keystore.setValue(event.keyUserUUID, key);
        await ipcRenderer.invoke("SaveKeystore", JSON.stringify(userData.keystore));
        break;
      }
      case 8: { // Key removed from keystore
        userData.keystore.clear(event.keyUserUUID);
        await ipcRenderer.invoke("SaveKeystore", JSON.stringify(userData.keystore));
        break;
      }
      case 9: { // Re-request entire keystore
        const keystore = await ipcRenderer.invoke("GETKeystore", userData.uuid);
        await ipcRenderer.invoke("SaveKeystore", JSON.stringify(keystore));
        userData.keystore = keystore;
        break;
      }
      case 420: // Because why not
        // Trigger fake socket disconnect
        reconnectAttempts = event.Attempts;
        if (socket.onclose != null)
          socket.onclose(new CloseEvent("Force-Close"));
          socket.close();
          break;
      default:
        console.warn(`Unknown event code ${event.EventType}`);
        break;
    }
  };
  socket.onerror = () => {
    Debug.Error(`Socket closed unexpectedly.  Attempting reconnect in ${timestepStates[reconnectAttempts - 1] / 1000}s`);
    if (reconnectAttempts > 4 || Manager.ReadConst<boolean>("LoggedOut")) {
      Manager.WriteConst("LoggedOut", true);
      Navigate("/login", { failed: true });
      return;
    }
    reconnect = setTimeout(HandleWebsocket, timestepStates[reconnectAttempts - 1]);
    reconnectAttempts++;
  };
  socket.onopen = () => {
    clearTimeout(reconnect);
    reconnectAttempts = 1;
    socket.send(token);
  };
  socket.onclose = () => {
    Debug.Warn(`Socket closed. Attempting reconnect in ${timestepStates[reconnectAttempts - 1] / 1000}s`);
    if (reconnectAttempts > 4 || Manager.ReadConst<boolean>("LoggedOut")) {
      Manager.WriteConst("LoggedOut", true);
      Navigate("/login", { failed: true });
      return;
    }
    reconnect = setTimeout(HandleWebsocket, timestepStates[reconnectAttempts - 1]);
    reconnectAttempts++;
  };
}

export async function FetchUserData() {
  Manager.UserData.uuid = Manager.ReadSettingTable<string>("User", "UUID") || "";
  Manager.UserData.token = Manager.ReadSettingTable<string>("User", "Token") || "";

  // Load priv/pub
  const priv = await ipcRenderer.invoke("GetPrivkey");
  const pub = await ipcRenderer.invoke("GetPubkey");
  Manager.UserData.keyPair = new RSAMemoryKeyPair(priv, pub);

  // Load Keystore
  Manager.UserData.keystore = <Dictionary<string>>Dictionary.fromJSON<string>(await ipcRenderer.invoke("LoadKeystore"));

  ipcRenderer.invoke("GETUser", Manager.UserData.uuid).then((value: IUser) => {
    if (value != null) {
      if (value.username != null) Manager.UserData.username = value.username;
      if (value.discriminator != null) Manager.UserData.discriminator = value.discriminator;
      if (value.avatar != null) Manager.UserData.avatarSrc = value.avatar;

      HandleWebsocket();
      Navigate("/chat", null);
    }
  });
}

export function Authenticate(data: Credentials) {
  return ipcRenderer.invoke("beginAuth", data, window.location.origin);
}

export function RemoveCachedCredentials() {
  //Manager.LoggedOut = true;
  Manager.WriteConst("LoggedOut", true);
  Manager.WriteSettingTable("User", "UUID", "");
  Manager.WriteSettingTable("User", "Token", "");
  Manager.Save();
  ipcRenderer.send("logout");
}

export function Register(data: Credentials) {
  return ipcRenderer.invoke("register", data);
}

export function setDefaultChannel(channelID: string) {
  //Manager.ReadString("DefaultChannel").setItem("lastOpenedChannel", channelID);
  Manager.WriteSetting("DefaultChannel", channelID);
}

export function copyToClipboard(text: string) {
  return ipcRenderer.invoke("copyToClipboard", text);
}
