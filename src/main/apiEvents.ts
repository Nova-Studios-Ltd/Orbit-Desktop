import { ipcMain } from 'electron';
import UserData from 'structs/UserData';
import type { IChannelProps } from 'renderer/components/Channels/Channel';
import type { IMessageProps } from 'renderer/components/Messages/Message';
import MessageAttachment from 'structs/MessageAttachment';
import sizeOf from 'image-size';
import { PassThrough } from 'stream';
import { createDecipheriv } from 'crypto';
import { readFileSync } from 'fs';
import { ContentType } from '../types/enums';
import { DeleteWithAuthentication, PostWithAuthentication, QueryWithAuthentication, PutWithAuthentication, PostFileWithAuthenticationAndEncryption, PostBufferWithAuthenticationAndEncryption, PatchWithAuthentication, PostFileWithAuthentication, GETWithAuthentication } from './NCAPI';
import { DecryptUsingAES, DecryptUsingPrivKey, DecryptUsingPrivKeyAsync, EncryptUsingAES, EncryptUsingAESAsync, EncryptUsingPubKey, GenerateKey } from './encryptionUtils';
import { AESMemoryEncryptData } from './encryptionClasses';

// User
ipcMain.handle('GETUser', async (_event, user_uuid: string) => {
  const resp = await QueryWithAuthentication(`User/${user_uuid}`);
  if (resp.status == 200 && resp.payload != undefined) return <UserData>resp.payload;
  return undefined;
});

ipcMain.on('GETUserChannels', async (event) => {
  const resp = await QueryWithAuthentication('/User/Channels');
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('GotUserChannels', <string[]>resp.payload);
});

ipcMain.handle('GETUserUUID', async (_event, username: string, discriminator: string) => {
  const resp = await QueryWithAuthentication(`/User/${username}/${discriminator}/UUID`);
  if (resp.status == 200 && resp.payload != undefined) return resp.payload;
  return 'UNKNOWN';
});

ipcMain.on('UPDATEUsername', async (event, user_uuid: string, newUsername: string) => {
  const resp = await PatchWithAuthentication(`/User/${user_uuid}/Username`, ContentType.TEXT, newUsername);
  if (resp.status == 200) event.sender.send('UsernameUpdated', true);
  else event.sender.send('UsernameUpdated', false);
});

ipcMain.on('UPDATEPassword', async (event, user_uuid: string, newPassword: string) => {
  const privKey = EncryptUsingAES(newPassword, readFileSync('rsa').toString());
  const resp = await PatchWithAuthentication(`/User/${user_uuid}/Password`, ContentType.JSON, JSON.stringify({password: newPassword, key: privKey}));
  if (resp.status == 200) event.sender.send('PasswordUpdated', true);
  else event.sender.send('PasswordUpdated', false);
})

ipcMain.on('UPDATEEmail', async (event, user_uuid: string, newEmail: string) => {
  const resp = await PatchWithAuthentication(`/User/${user_uuid}/Email`, ContentType.TEXT, newEmail);
  if (resp.status == 200) event.sender.send('EmailUpdated', true);
  else event.sender.send('EmailUpdated', false);
});

ipcMain.on('DELETEUser', async (event, user_uuid: string) => {
  const resp = await DeleteWithAuthentication(`/User/${user_uuid}`);
  if (resp.status == 200) event.sender.send('UserDeleted', true);
  else event.sender.send('UserDeleted', false);
});

// User Keystore
ipcMain.handle('GETKey', async (_event, user_uuid: string, key_user_uuid: string) => {
  const resp = await QueryWithAuthentication(`/User/${user_uuid}/Keystore/${key_user_uuid}`);
  if (resp.status == 200) return <string>resp.payload;
  return '';
});

ipcMain.handle('GETKeystore', async (_event, user_uuid: string) => {
  const resp = await QueryWithAuthentication(`/User/${user_uuid}/Keystore`);
  if (resp.status == 200) return <{ [key: string] : string; }>resp.payload;
  return {};
});

ipcMain.handle('SETKey', async (_event, user_uuid: string, key_user_uuid: string, key: string) => {
  const resp = await PostWithAuthentication(`/User/${user_uuid}/Keystore/${key_user_uuid}`, ContentType.JSON, key);
  if (resp.status == 200) return true;
  return false;
});

// Messages
ipcMain.handle('GETMessage', async (_event, channel_uuid: string, message_id: string, userData: UserData) => {
  const resp = await QueryWithAuthentication(`/Message/${channel_uuid}/Messages/${message_id}`);
  if (resp.status == 200 && resp.payload != undefined) {
    const rawMessage = <IMessageProps>resp.payload;
    const key = DecryptUsingPrivKey(userData.keyPair.PrivateKey, rawMessage.encryptedKeys[userData.uuid]);
    const decryptedMessage = DecryptUsingAES(key, new AESMemoryEncryptData(rawMessage.iv, rawMessage.content));
    rawMessage.content = decryptedMessage;
    for (let a = 0; a < rawMessage.attachments.length; a++) {
      const attachment = rawMessage.attachments[a];
      const content = await GETWithAuthentication(attachment.contentUrl);
      const cipher = createDecipheriv('aes-256-ctr', Buffer.from(key, 'base64'), Buffer.from(rawMessage.iv, 'base64'));
      const d = new PassThrough();
      d.end(content.payload);
      const buffer = await new Promise<Buffer>((resolve) => {
        const out = new PassThrough();
        const buffers = [] as Uint8Array[];
        out.on('data', (chunk) => buffers.push(chunk));
        out.on('end', () => {
          resolve(Buffer.concat(buffers));
        });
        d.pipe(cipher).pipe(out);
      });
      rawMessage.attachments[a].content = Uint8Array.from(buffer);
    }
    return rawMessage;
  }
  return undefined;
});

ipcMain.on('GETMessagesWithArgs', async (event, channel_uuid: string, userData: UserData, limit = 30, before = 2147483647) => {
  const resp = await QueryWithAuthentication(`/Message/${channel_uuid}/Messages?limit=${limit}&before=${before}`);
  if (resp.status == 200 && resp.payload != undefined) {
    const rawMessages = <IMessageProps[]>resp.payload
    const decryptedMessages = [] as IMessageProps[];
    for (let m = 0; m < rawMessages.length; m++) {
      const message = rawMessages[m];
      const key = DecryptUsingPrivKey(userData.keyPair.PrivateKey, message.encryptedKeys[userData.uuid]);
      if (message.content.length != 0) {
        const decryptedMessage = DecryptUsingAES(key, new AESMemoryEncryptData(message.iv, message.content));
        message.content = decryptedMessage;
      }
      for (let a = 0; a < message.attachments.length; a++) {
        const attachment = message.attachments[a];
        const content = await GETWithAuthentication(attachment.contentUrl);
        const cipher = createDecipheriv('aes-256-ctr', Buffer.from(key, 'base64'), Buffer.from(message.iv, 'base64'));
        const d = new PassThrough();
        d.end(content.payload);
        const buffer = await new Promise<Buffer>((resolve) => {
          const out = new PassThrough();
          const buffers = [] as Uint8Array[];
          out.on('data', (chunk) => buffers.push(chunk));
          out.on('end', () => {
            resolve(Buffer.concat(buffers));
          });
          d.pipe(cipher).pipe(out);
        });
        message.attachments[a].content = Uint8Array.from(buffer);
      }
      decryptedMessages.push(message);
    }
    event.sender.send('GotMessagesWithArgs', decryptedMessages, channel_uuid);
  }
});

ipcMain.on('GETMessages', async (event, channel_uuid: string, userData: UserData) => {
  const resp = await QueryWithAuthentication(`/Message/${channel_uuid}/Messages`);
  if (resp.status == 200 && resp.payload != undefined) {
    const rawMessages = <IMessageProps[]>resp.payload
    const decryptedMessages = [] as IMessageProps[];
    for (let m = 0; m < rawMessages.length; m++) {
      const message = rawMessages[m];
      const key = DecryptUsingPrivKey(userData.keyPair.PrivateKey, message.encryptedKeys[userData.uuid]);
      if (message.content.length != 0) {
        const decryptedMessage = DecryptUsingAES(key, new AESMemoryEncryptData(message.iv, message.content));
        message.content = decryptedMessage;
      }
      for (let a = 0; a < message.attachments.length; a++) {
        const attachment = message.attachments[a];
        const content = await GETWithAuthentication(attachment.contentUrl);
        const cipher = createDecipheriv('aes-256-ctr', Buffer.from(key, 'base64'), Buffer.from(message.iv, 'base64'));
        const d = new PassThrough();
        d.end(content.payload);
        const buffer = await new Promise<Buffer>((resolve) => {
          const out = new PassThrough();
          const buffers = [] as Uint8Array[];
          out.on('data', (chunk) => buffers.push(chunk));
          out.on('end', () => {
            resolve(Buffer.concat(buffers));
          });
          d.pipe(cipher).pipe(out);
        });
        message.attachments[a].content = Uint8Array.from(buffer);
      }
      decryptedMessages.push(message);
    }
    event.sender.send('GotMessages', decryptedMessages, channel_uuid);
  }
});

ipcMain.on('SENDMessage', async (event, channel_uuid: string, contents: string, rawAttachments: MessageAttachment[], userData: UserData) => {
  const resp = await QueryWithAuthentication(`/Channel/${channel_uuid}`);
  if (resp.status == 200 && resp.payload != undefined) {
    const channel = <IChannelProps>resp.payload;
    if (channel.members == undefined) {
      event.sender.send('MessageSent', false);
      return;
    }
    const messageKey = GenerateKey(32);
    const encryptedMessage = EncryptUsingAES(messageKey, contents);

    // Handle Attachments
    const attachments = [] as string[];
    for (let a = 0; a < rawAttachments.length; a++) {
      const file = rawAttachments[a];
      let width = 0;
      let height = 0;
      if (!file.isBuffer && new RegExp(/\.(jpeg|jpg|png|gif|webp)$/).test(file.contents)) {
        const dims = sizeOf(file.contents);
        width = dims.width || 0;
        height = dims.height || 0;
        const re = await PostFileWithAuthenticationAndEncryption(`Media/Channel/${channel_uuid}?width=${width}&height=${height}`, file.contents, messageKey, encryptedMessage.iv);
        if (re != undefined && re.payload != undefined) attachments.push(<string>re.payload);
      }
      else if (file.isBuffer) {
        const b = Buffer.from(file.contents, 'base64')
        const dims = sizeOf(b);
        width = dims.width || 0;
        height = dims.height || 0;
        const re = await PostBufferWithAuthenticationAndEncryption(`Media/Channel/${channel_uuid}?width=${width}&height=${height}`, b, messageKey, encryptedMessage.iv);
        if (re != undefined && re.payload != undefined) attachments.push(<string>re.payload);
      }
      else {
        const re = await PostFileWithAuthenticationAndEncryption(`Media/Channel/${channel_uuid}?width=${width}&height=${height}`, file.contents, messageKey, encryptedMessage.iv);
        if (re != undefined && re.payload != undefined) attachments.push(<string>re.payload);
      }
    }

    const encKeys = {} as {[uuid: string]: string; };
    channel.members.forEach((member) => {
      if (member != userData.uuid) {
        const pubKey = userData.keystore[member];
        if (pubKey != undefined) {
          const encryptedKey = EncryptUsingPubKey(pubKey, messageKey);
          encKeys[member] = encryptedKey;
        }
      }
    });
    encKeys[userData.uuid] = EncryptUsingPubKey(userData.keyPair.PublicKey, messageKey);
    const mPost = await PostWithAuthentication(`/Message/${channel_uuid}/Messages`, ContentType.JSON, JSON.stringify({Content: encryptedMessage.content, IV: encryptedMessage.iv, EncryptedKeys: encKeys, Attachments: attachments}));
    if (mPost.status == 200) event.sender.send('MessageSent', true);
    else event.sender.send('MessageSent', false);
    return;
  }
  event.sender.send('MessageSent', false);
});

ipcMain.handle('EDITMessage', async (_event, channel_uuid: string, message_id: string, message: string, encryptedKeys: {[uuid: string] : string;}, iv: string, userData: UserData) => {
  const key = await DecryptUsingPrivKeyAsync(userData.keyPair.PrivateKey, encryptedKeys[userData.uuid]);
  const c = await EncryptUsingAESAsync(key, message, iv);
  const resp = await PutWithAuthentication(`Message/${channel_uuid}/Messages/${message_id}`, ContentType.JSON, JSON.stringify({content: c.content}));
  if (resp.status == 200) return true;
  return false;
});

ipcMain.handle('DELETEMessage', async (_event, channel_uuid: string, message_id: string) => {
  const resp = await DeleteWithAuthentication(`Message/${channel_uuid}/Messages/${message_id}`);
  if (resp.status == 200) return true;
  return false;
});

// Channels
ipcMain.handle('GETChannel', async (_event, channel_uuid: string) => {
  const resp = await QueryWithAuthentication(`/Channel/${channel_uuid}`);
  if (resp.status == 200 && resp.payload != undefined) return <IChannelProps>resp.payload;
  return undefined;
});

ipcMain.on('CREATEChannel', async (event, recipient_uuid: string) => {
  const resp = await PostWithAuthentication(`Channel/CreateChannel?recipient_uuid=${recipient_uuid}`, ContentType.JSON, '');
  if (resp.status == 200) event.sender.send('ChannelCreated', true);
  else event.sender.send('ChannelCreated', false);
});

ipcMain.on('CREATEGroupChannel', async (event, groupName: string, receipients: string[]) => {
  const resp = await PostWithAuthentication(`Channel/CreateGroupChannel?group_name=${groupName}`, ContentType.JSON, JSON.stringify(receipients));
  if (resp.status == 200) event.sender.send('GroupChannelCreated', true);
  else event.sender.send('GroupChannelCreated', false);
});

ipcMain.on('UPDATEChannelName', async (event, channel_uuid: string, newName: string) => {
  const resp = await PatchWithAuthentication(`/Channel/${channel_uuid}/Name?new_name=${newName}`, ContentType.EMPTY, '');
  if (resp.status == 200) event.sender.send('ChannelNameUpdated', true);
  event.sender.send('ChannelNameUpdated', false);
});

ipcMain.on('ADDChannelMember', async (event, channel_uuid: string, recipients: string[]) => {
  const resp = await PatchWithAuthentication(`/Channel/${channel_uuid}`, ContentType.JSON, JSON.stringify(recipients))
  if (resp.status == 200) event.sender.send('ChannelMemberAdded', true);
  event.sender.send('ChannelMemberAdded', false);
});

ipcMain.on('ARCHIVEChannel', async (event, channel_uuid: string) => {
  const resp = await PatchWithAuthentication(`/Channel/${channel_uuid}/Achrive`, ContentType.EMPTY, '');
  if (resp.status == 200) event.sender.send('ChannelArchived', true);
  event.sender.send('ChannelArchived', false);
});

ipcMain.on('UNARCHIVEChannel', async (event, channel_uuid: string) => {
  const resp = await PatchWithAuthentication(`/Channel/${channel_uuid}/Unachrive`, ContentType.EMPTY, '');
  if (resp.status == 200) event.sender.send('ChannelUnarchived', true);
  event.sender.send('ChannelUnarchived', false);
});

ipcMain.on('DELETEChannel', async (event, channel_uuid: string) => {
  const resp = await DeleteWithAuthentication(`/Channel/${channel_uuid}`);
  if (resp.status == 200) event.sender.send('ChannelDeleted', true);
  event.sender.send('ChannelDeleted', false);
});

ipcMain.on('REMOVEChannelMember', async (event, channel_uuid: string, recipient: string) => {
  const resp = await DeleteWithAuthentication(`/Channel/${channel_uuid}/Members?recipient=${recipient}`)
  if (resp.status == 200) event.sender.send('ChannelMemberRemoved', true);
  event.sender.send('ChannelMemberRemoved', false);
});

// Media
ipcMain.on('SETAvatar', async (event, user_uuid: string, file: string) => {
  const resp = await PostFileWithAuthentication(`/Media/Avatar/${user_uuid}`, file);
  if (resp.status == 200) event.sender.send('AvatarSet', true);
  event.sender.send('AvatarSet', false);
});

ipcMain.on('SETChannelIcon', async (event, channel_uuid: string, file: string) => {
  const resp = await PostFileWithAuthentication(`/Media/Channel/${channel_uuid}`, file);
  if (resp.status == 200) event.sender.send('ChannelIconSet', true);
  event.sender.send('ChannelIconSet', false);
});

ipcMain.handle('GETChannelName', async (_event, uuid: string) => {
  const resp = await QueryWithAuthentication(`/Channel/${uuid}`);
  if (resp.status == 200 && resp.payload != undefined) return (<IChannelProps>resp.payload).channelName;
  return 'Failed to get channel name';
});

ipcMain.handle('POSTChannelContent', async (_event, channel_uuid: string, file: string) => {
  const resp = await PostFileWithAuthentication(`/Media/Channel/${channel_uuid}`, file);
  if (resp.status == 200 && resp.payload != undefined) return resp.payload;
  return undefined;
});
