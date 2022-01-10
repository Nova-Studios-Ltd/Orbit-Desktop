/* eslint global-require: off, no-console: off, promise/always-return: off */

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, Menu, shell, Tray } from 'electron';
//import { autoUpdater } from 'electron-updater';
import { sync as checkCommand } from 'command-exists';
import http, { IncomingMessage, ServerResponse } from 'http';
import { Server } from 'node-static';

import GLOBALS from '../shared/globals';
import { DebugMain } from '../shared/DebugLogger';
import { LogContext } from '../types/enums';
import { isDevelopment, resolveHtmlPath } from './util';

import './events';
import './apiEvents';
import './debugEvents';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
//let allowCompleteExit = false;

// Check if spotify is installed
const spotifyInstalled = checkCommand('spotify');

/*export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}*/

DebugMain.Log('Just A Message', LogContext.Main);
DebugMain.Success('Just A Success', LogContext.Main);
DebugMain.Warn('Just A Warning', LogContext.Main);
DebugMain.Error('Just A Error', LogContext.Main);


if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();

  DebugMain.Log(path.resolve(__dirname, '../renderer/'), LogContext.Main);
  const server = new Server(path.resolve(__dirname, '../renderer/'));

  http.createServer((request: IncomingMessage, response: ServerResponse) => {
    request.addListener('end', () => {
      // Be aware of memory caching
      // Handles react router weridness
      // Serves 'index.html' for any request of '/login'or '/register' etc.
      // If the request url includes a filter it serves that file directly
      DebugMain.Log(`Before: ${request.url}`, LogContext.Main);
      if (!request.url?.includes('styles.css') && !request.url?.includes('style.css') && !request.url?.includes('renderer.js'))
        request.url = resolveHtmlPath('index.html');
      DebugMain.Log(`After: ${request.url}`, LogContext.Main);
      server.serve(request, response);
    }).resume();
  }).listen(process.env.port || 1212);
}

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
    .catch((e: Error) => DebugMain.Error(e.message, LogContext.Main, 'when initializing extensions'));
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
  if (isDevelopment) {
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
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.removeMenu();
  mainWindow.webContents.openDevTools();

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
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
    DebugMain.Log(`Opening file ${url} in default browser`, LogContext.Main);
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
  // AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
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
    app.quit();
  }

  try {
    tray = new Tray('assets/icon.png');
    const contextMenu = Menu.buildFromTemplate([
      { label: `${GLOBALS.appName} (Version ${GLOBALS.appVersion})` },
      { type: 'separator' },
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
  }

  createWindow().then(() => {
    DebugMain.Success('App Loaded', LogContext.Main);
  });

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow().catch(console.log);
  });

}).catch((e) => DebugMain.Error(e.message, LogContext.Main, 'on app initialization'));
