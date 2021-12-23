import { clipboard, dialog, ipcMain, session, Notification } from 'electron';
import fs from 'fs';
import type { IChannelProps, IMessageDeleteRequestArgs, IMessageProps, INotificationProps } from 'types/interfaces';
import MessageAttachment from 'structs/MessageAttachment';
import Credentials from '../structs/Credentials';
import { DebugMain } from '../shared/DebugLogger';
import { ChannelType, ContentType, FormAuthStatusType, LogType, LogContext } from '../types/enums';
import { DeleteWithAuthentication, PostWithAuthentication, QueryWithAuthentication, PostWithoutAuthentication, PutWithAuthentication, PostFileWithAuthentication, SetCookie, PostBufferWithAuthentication, NCAPIResponse } from './NCAPI';

ipcMain.handle('beginAuth', async (event, creds: Credentials) : Promise<FormAuthStatusType> => {
  const resp = await PostWithoutAuthentication('Login', ContentType.JSON, JSON.stringify({password: creds.password, email: creds.email}));
  if (resp.status == 403 || resp.status == 404) return FormAuthStatusType.genericIncorrectUsernamePassword;
  if (resp.status == 500) return FormAuthStatusType.serverError;
  if (resp.status == 200 && resp.payload != undefined && await SetCookie('userData', JSON.stringify(resp.payload))) {
    event.sender.send('endAuth', true);
    return FormAuthStatusType.success;
  }
  return FormAuthStatusType.serverError;
});

ipcMain.on('logout', () => {
  session.defaultSession.cookies.remove('http://localhost', 'userData');
});

ipcMain.handle('register', async (_event, creds: Credentials) : Promise<boolean> => {
  const resp = await PostWithoutAuthentication('Register', ContentType.JSON, JSON.stringify({username: creds.username, password: creds.password, email: creds.email}));
  if (resp.status == 200) return true;
  return false;
});

ipcMain.handle('copyToClipboard', async (_, data: string) => {
  try {
    clipboard.writeText(data);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('copyImageFromClipboard', async () => {
  try {
    return clipboard.readImage().toPNG().toString('binary');
  }
  catch{
    return null;
  }
});

ipcMain.on('toast', (_, notification: INotificationProps) => {
  new Notification({ title: notification.title, body: notification.body }).show();
});

ipcMain.on('pickUploadFiles', (event) => {
  dialog.showOpenDialog({ properties: ['openFile', 'multiSelections', 'showHiddenFiles'] }).then((r) => {
    if (!r.canceled) event.sender.send('pickedUploadFiles', r.filePaths);
  }).catch((e) => DebugMain.Error(e.message, LogContext.Main, 'when trying to retrieve paths from file picker for file uploading'));
});

ipcMain.handle('OpenFile', async (_event) => {
  const result = await dialog.showOpenDialog({ properties: ['openFile', 'showHiddenFiles'], filters: [
    { name: 'All Files', extensions: ['*'] },
    { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
  ] });
  if (!result.canceled) return result.filePaths[0];
  return undefined;
})

ipcMain.handle('uploadFile', async (_event, channel_uuid: string, attachments: string) => {
  const file = <MessageAttachment>JSON.parse(attachments);
  console.log(file);
  if (!file.isBuffer)
    return PostFileWithAuthentication(`Media/Channel/${channel_uuid}`, file.contents);
  return PostBufferWithAuthentication(`Media/Channel/${channel_uuid}`, Buffer.from(file.contents));
});

ipcMain.handle('saveSetting', (key: string, value: string | boolean | number) => {
  //fs.writeFile('settings.json', );
  // Store settings in an object andy, and serialize that to disk when you need to save, unless were gonna store like a gb of settings
  // You will have to rewrite the entire file anyways to update a single setting, unless you spend the time update just that location in the file
  // Perhaps make yourself a SettingsManager class that handles are the control logic
  // And these events, help keep this file cleaner maybe?
});

ipcMain.handle('retrieveSetting', (key: string) => {
  return 'Not Implemented';
});
