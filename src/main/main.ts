/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import http, { IncomingMessage, ServerResponse } from 'http';
import path, { resolve } from 'path';
import { app, BrowserWindow, Menu, shell, Tray } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';
import GLOBALS from '../shared/globals';
import { DebugMain } from '../shared/DebugLogger';
import './events';
import './apiEvents';
import './debugEvents';
import { LogContext, LogType } from '../types/enums';

const stat = require('node-static');
const checkCommand = require('command-exists').sync;

const file = new stat.Server(path.resolve(__dirname, '../renderer/'));
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let allowCompleteExit = false;

// Check if spotify is installed
const spotifyInstalled = checkCommand('spotify');

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();

  http.createServer((request: IncomingMessage, response: ServerResponse) => {
    request.addListener('end', () => {
      file.serve(request, response);
    }).resume();
  }).listen(1212);
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch((e) => DebugMain.Error(e, LogContext.Main, 'when initializing extensions'));
};

function getSpotifyTrackId(url: string) {
  const m = url.match(/(?<=k\/)(.*(?=\?)|.*(?=$)*)/g);
  if (m == null) return '';
  return m[0];
}

function getSpotifyPlaylistId(url: string) {
  const m = url.match(/(?<=t\/)(.*(?=\?)|.*(?=$)*)/g);
  if (m == null) return '';
  return m[0];
}

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minWidth: 640,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.removeMenu();

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/main/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      DebugMain.Error('mainWindow is not defined', LogContext.Main, '(when creating the window)');
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
    DebugMain.Success('Main Window Loaded', LogContext.Main);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (!GLOBALS.closeToTray) {
      app.quit();
    }
  });

  mainWindow.on('focus', () => {
    mainWindow?.webContents.send('clientFocused', true);
  });

  mainWindow.on('blur', () => {
    mainWindow?.webContents.send('clientUnfocused', true);
  });

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    if (url.includes('track') && spotifyInstalled) {
      shell.openExternal(`spotify://track/${getSpotifyTrackId(url)}`);
    }
    else if (url.includes('playlist') && spotifyInstalled) {
      shell.openExternal(`spotify://playlist/${getSpotifyPlaylistId(url)}`);
    }
    else {
      shell.openExternal(url);
    }
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  /*if (process.platform !== 'darwin') {
    app.quit();
  }*/
});

app.whenReady().then(() => {
  function resume() {
    if (mainWindow != null) {
      mainWindow?.show();
      mainWindow?.webContents.send('trayResumeClient');
    }
    else {
      createWindow();
    }
  }

  function quit() {
    allowCompleteExit = true;
    app.quit();
  }

  try {
    tray = new Tray('assets/icon.png');
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open', click: () => resume() },
      { type: 'separator' },
      { label: 'Exit', click: () => quit() }
    ]);
    tray.on('click', () => {
      resume();
    });
    tray.setToolTip('Nova Chat 3');
    tray.setContextMenu(contextMenu);
  }
  catch {
    DebugMain.Error('Unable to load tray icon', LogContext.Main);
    allowCompleteExit = true;
  }

  DebugMain.Success('App Loaded', LogContext.Main);
  createWindow();
}).catch((e) => DebugMain.Error(e.message, LogContext.Main, 'on app initialization'));

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

app.on('before-quit', () => {
  return (!GLOBALS.closeToTray && allowCompleteExit);
});
