import { ipcMain } from 'electron';
import UserData from 'structs/UserData';
import type { IChannelProps, IMessageProps } from 'types/interfaces';
import { ContentType } from '../types/enums';
import { DeleteWithAuthentication, PostWithAuthentication, QueryWithAuthentication, PutWithAuthentication, PostFileWithAuthentication, PatchWithAuthentication } from './NCAPI';

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

// TODO Add type for 'data'
ipcMain.on('EDITUser', (_event, user_uuid: string, data: any) => {

});

ipcMain.on('DELETEUser', async (event, user_uuid: string) => {
  const resp = await DeleteWithAuthentication(`/User/${user_uuid}`);
  if (resp.status == 200) event.sender.send('UserDeleted', true);
  else event.sender.send('UserDeleted', false);
});


// Messages
ipcMain.handle('GETMessage', async (_event, channel_uuid: string, message_id: string) => {
  const resp = await QueryWithAuthentication(`/Message/${channel_uuid}/Messages/${message_id}`);
  if (resp.status == 200 && resp.payload != undefined) return <IMessageProps>resp.payload;
  return undefined;
});

ipcMain.on('GETMessages', async (event, channel_uuid: string) => {
  const resp = await QueryWithAuthentication(`/Message/${channel_uuid}/Messages`);
  if (resp.status == 200 && resp.payload != undefined) event.sender.send('GotMessages', <IMessageProps[]>resp.payload, channel_uuid);
});

ipcMain.on('SENDMessage', async (_event, channel_uuid: string, contents: string, attachments: string[]) => {
  await PostWithAuthentication(`/Message/${channel_uuid}/Messages`, ContentType.JSON, JSON.stringify({Content: contents, Attachments: attachments}));
});

ipcMain.handle('EDITMessage', async (_event, channel_uuid: string, message_id: string, message: string) => {
  const resp = await PutWithAuthentication(`Message/${channel_uuid}/Messages/${message_id}`, ContentType.JSON, JSON.stringify({content: message}));
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

ipcMain.handle('POSTChannelContent', async (_event, channel_uuid: string, file: string) => {
  const resp = await PostFileWithAuthentication(`/Media/Channel/${channel_uuid}`, file);
  if (resp.status == 200 && resp.payload != undefined) return resp.payload;
  return undefined;
});
