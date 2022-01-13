import { clipboard, dialog, ipcMain, session, Notification } from 'electron';
import { INotificationProps } from 'renderer/components/Notification/Notification';
import { unlinkSync, readFileSync, writeFileSync, existsSync, writeFile, statSync } from 'fs';
import type { AuthResponse } from 'types/NCAPIResponseMutations';
import Credentials from '../structs/Credentials';
import { Debug } from '../shared/DebugLogger';
import { ContentType, FormAuthStatusType } from '../types/enums';
import { PostWithoutAuthentication } from './NCAPI';
import { DecryptUsingAES, EncryptUsingAESAsync, GenerateRSAKeyPairAsync, GenerateSHA256HashAsync } from './encryptionUtils';


ipcMain.handle('beginAuth', async (event, creds: Credentials) : Promise<FormAuthStatusType> => {
  const a = await PostWithoutAuthentication('Login', ContentType.JSON, JSON.stringify({password: creds.password, email: creds.email})).then((resp: AuthResponse) => {
    if (resp.status == 403 || resp.status == 404) return FormAuthStatusType.genericIncorrectUsernamePassword;
    if (resp.status == 500) return FormAuthStatusType.serverError;
    if (resp.status == 200 && resp.payload != undefined && creds.password != undefined) {
      const login = resp.payload;
      const decryptedKey = DecryptUsingAES(creds.password, login.key);
      writeFile("rsa", decryptedKey, () => event.sender.send('endAuth', decryptedKey, login.publicKey, login.uuid, login.token));
      Debug.Success(`User ${login.uuid} Logged In Successfully`);
      return FormAuthStatusType.success;
    }
    return FormAuthStatusType.serverError;
  });
  return a;
});

ipcMain.on('logout', () => {
  session.defaultSession.cookies.remove('http://localhost', 'userData');
  if (existsSync('keystore')) unlinkSync('keystore');
  if (existsSync('rsa')) unlinkSync('rsa');
  if (existsSync('rsa.pub')) unlinkSync('rsa.pub');
  Debug.Success("Logged out successfully");
});

ipcMain.handle('register', async (_event, creds: Credentials) : Promise<boolean> => {
  if (creds.password == undefined) return false;
  const keypair = await GenerateRSAKeyPairAsync();
  const encryptedKey = await EncryptUsingAESAsync(creds.password, keypair.PrivateKey);
  const key = { priv: encryptedKey.content, privIV: encryptedKey.iv, pub: keypair.PublicKey };
  const resp = await PostWithoutAuthentication('Register', ContentType.JSON, JSON.stringify({username: creds.username, password: creds.password, email: creds.email, key}));
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
    return clipboard.readImage().toPNG().toString('base64');
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
  }).catch((e) => Debug.Error(e.message, 'when trying to retrieve paths from file picker for file uploading'));
});

ipcMain.handle('OpenFile', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openFile', 'showHiddenFiles'], filters: [
    { name: 'All Files', extensions: ['*'] },
    { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
  ] });
  if (!result.canceled) {
    const path = result.filePaths[0];
    if (existsSync(path)) {
      try {
        const { size } = statSync(path);
        if (size < 512000000) {
          const contents = readFileSync(path);
          return { path, contents };
        }
        Debug.Error(`Requested file ${path} is too big (${size}) to load into buffer, but returning path anyways`, 'when picking file');
        return { path };
      }
      catch {
        Debug.Error(`Error reading file ${path} into buffer, but returning path anyways`, 'when picking file');
        return { path };
      }
    }
    Debug.Error(`Requested file ${path} does not exist`, 'when picking file');
  }
  return undefined;
})

ipcMain.handle('saveSetting', (_event, key: string, value: string | boolean | number) => {
  // fs.writeFile('settings.json', );
  // Store settings in an object andy, and serialize that to disk when you need to save, unless were gonna store like a gb of settings
  // You will have to rewrite the entire file anyways to update a single setting, unless you spend the time update just that location in the file
  // Perhaps make yourself a SettingsManager class that handles are the control logic
  // And these events, help keep this file cleaner maybe?
});

ipcMain.handle('retrieveSetting', (_event, key: string) => {
  return 'Not Implemented';
});


// Read/Write Priv/Pub key
ipcMain.handle('SetPrivkey', async (_event, key: string) : Promise<boolean> => {
  try {
    writeFileSync("rsa", key);
    return true;
  }
  catch (err) {
    return false;
  }
});

ipcMain.handle('GetPrivkey', async (_event) : Promise<string> => {
  try {
    return readFileSync('rsa', 'utf-8');
  }
  catch {
    return '';
  }
});

ipcMain.handle('SetPubkey', async (_event, key: string) : Promise<boolean> => {
  try {
    Debug.Log('Writing public key to file');
    writeFileSync("rsa.pub", key);
    return true;
  }
  catch (err) {
    return false;
  }
});

ipcMain.handle('GetPubkey', async (_event) : Promise<string> => {
  try {
    return readFileSync('rsa.pub', 'utf-8');
  }
  catch {
    return '';
  }
});

ipcMain.handle('SaveKeystore', async (_event, keys: { [key: string] : string; }) : Promise<boolean> => {
  try {
    writeFileSync("keystore", JSON.stringify(keys));
    return true;
  }
  catch (err) {
    return false;
  }
});

ipcMain.handle('LoadKeystore', async (_event) : Promise<{ [key: string] : string; }> => {
  try {
    return <{ [key: string] : string; }>JSON.parse(readFileSync('keystore', 'utf-8'));
  }
  catch {
    return {};
  }
});

ipcMain.handle('SHA256HASH', async (_event, data: string) => {
  const hash = await GenerateSHA256HashAsync(data);
  return hash;
})
