/* eslint global-require: off, no-console: off, promise/always-return: off */

import "core-js/stable";
import "regenerator-runtime/runtime";
import path from "path";
import { app, BrowserWindow, ipcMain, Menu, shell, Tray } from "electron";
//import { autoUpdater } from "electron-updater";
import { sync as checkCommand } from "command-exists";

import { Debug } from "./debug";
import { getAssetPath, isDevelopment, resolveHtmlPath } from "./util";
import { Manager, CreateManager } from "./settingsManager";
import { defaultSettings } from "./settingsDefaults";

import "./events";
import "./apiEvents";
import "./debugEvents";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
//let allowCompleteExit = false;

// Check if spotify is installed
const spotifyInstalled = checkCommand("spotify");

/*export default class AppUpdater {
  constructor() {
    log.transports.file.level = "info";
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}*/

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();}

if (isDevelopment) {
  require("electron-debug")();
}

const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS"];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch((e: Error) => Debug.Error(e.message, "when initializing extensions"));
};

function getSpotifyTrackId(url: string) {
  const m = url.match(/(?<=k\/)(.*(?=\?)|.*(?=$)*)/g);
  if (m == null) return "";
  return m[0];
}

function getSpotifyPlaylistId(url: string) {
  const m = url.match(/(?<=t\/)(.*(?=\?)|.*(?=$)*)/g);
  if (m == null) return "";
  return m[0];
}

const createWindow = async () => {
  /*if (isDevelopment) {
    await installExtensions();
  }*/

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath("icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  CreateManager(mainWindow.webContents, defaultSettings);

  mainWindow.removeMenu();

  mainWindow.loadURL(resolveHtmlPath("index.html"));

  mainWindow.on("ready-to-show", () => {
    if (!mainWindow) {
      Debug.Error("mainWindow is undefined", "(when creating the window)");
      throw new Error("'mainWindow' is undefined");
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
    Debug.Success("Main Window Loaded");
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (!Manager.ReadConst<boolean>("CloseToTray")) {
      app.quit();
    }
  });

  mainWindow.on("focus", () => {
    mainWindow?.webContents.send("clientFocused", true);
  });

  mainWindow.on("blur", () => {
    mainWindow?.webContents.send("clientUnfocused", true);
  });

  // Open urls in the user"s browser
  mainWindow.webContents.on("new-window", (event, url) => {
    event.preventDefault();
    Debug.Log(`Opening file ${url} in default browser`);
    if (url.includes("track") && spotifyInstalled) {
      shell.openExternal(`spotify://track/${getSpotifyTrackId(url)}`);
    }
    else if (url.includes("playlist") && spotifyInstalled) {
      shell.openExternal(`spotify://playlist/${getSpotifyPlaylistId(url)}`);
    }
    else {
      shell.openExternal(url);
    }
  });

  // Remove this if your app does not use auto updates
  // AppUpdater();
};

/**
 * Add event listeners...
 */

ipcMain.on("openDevTools", () => {
  mainWindow?.webContents.openDevTools();
});

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  Manager.SaveSettings();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(() => {
  function resume() {
    if (mainWindow != null) {
      mainWindow?.show();
      mainWindow?.webContents.send("trayResumeClient");
    }
    else {
      createWindow();
    }
  }

  function quit() {
    app.quit();
  }

  try {
    tray = new Tray(getAssetPath("icon.png"));
    const contextMenu = Menu.buildFromTemplate([
      { label: `${Manager.ReadConst<string>("AppName")} (Version ${Manager.ReadConst<string>("AppVersion")})` },
      { type: "separator" },
      { label: "Open", click: () => resume() },
      { type: "separator" },
      { label: "Exit", click: () => quit() }
    ]);
    tray.on("click", () => {
      resume();
    });
    tray.setToolTip(Manager.ReadConst<string>("AppName"));
    tray.setContextMenu(contextMenu);
  }
  catch (error) {
    Debug.Error("Unable to load tray icon", String(error));
  }

  createWindow().then(() => {
    Debug.Success("App Loaded");
  });

  app.on("activate", () => {
    // On macOS it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow().catch(Debug.Log);
  });

}).catch((e) => Debug.Error(e.message, "on app initialization"));
