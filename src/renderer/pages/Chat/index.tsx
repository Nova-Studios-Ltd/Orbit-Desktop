import React, { MouseEvent } from 'react';
import { Add as PlusIcon, Chat as ChatIcon , List as ListIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import MessageCanvas from 'renderer/components/Messages/MessageCanvas';
import { Debug, Navigate, ipcRenderer, events, setDefaultChannel, RemoveCachedCredentials } from 'shared/helpers';
import ChannelView from 'renderer/components/Channels/ChannelView';
import Channel from 'renderer/components/Channels/Channel';
import MessageInput from 'renderer/components/Messages/MessageInput';
import Header from 'renderer/components/Header/Header';
import GLOBALS from 'shared/globals'
import UserDropdownMenu, { IUserDropdownMenuFunctions } from 'renderer/components/UserDropdown/UserDropdownMenu';
import AppNotification from 'renderer/components/Notification/Notification';
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, IconButton, List, MenuItem, SelectChangeEvent } from '@mui/material';
import { ChannelType, LogContext, NotificationAudienceType, NotificationStatusType } from 'types/enums';
import FormTextField from 'renderer/components/Form/FormTextField';
import FormDropdown from 'renderer/components/Form/FormDropdown';
import { GrowTransition } from 'types/transitions';
import HybridListItem from 'renderer/components/List/HybridListItem';
import MessageAttachment from 'structs/MessageAttachment';
import FileUploadSummary from 'renderer/components/Messages/FileUploadSummary';
import type { IMessageProps } from 'renderer/components/Messages/Message';
import type { IChannelProps } from 'renderer/components/Channels/Channel';

interface IChatPageProps {

}

interface IChatPageState {
  CanvasObject?: MessageCanvas,
  ChannelList?: ChannelView,
  ChannelName: string,
  AttachmentList: Array<MessageAttachment>,
  CreateChannelDialogChannelName: string,
  CreateChannelDialogRecipients: {[username: string]: string},
  CreateChannelDialogVisible: boolean,
  CreateChannelDialogChannelType: ChannelType,
  CreateChannelDialogRecipientAvatarSrc: string,
  NavigationDrawerOpen: boolean
}

export default class ChatPage extends React.Component<IChatPageProps> {
  UserDropdownMenuFunctions: IUserDropdownMenuFunctions;
  state: IChatPageState;

  constructor(props: IChatPageProps) {
    super(props);
    this.initCanvas = this.initCanvas.bind(this);
    this.initChannelView = this.initChannelView.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.appendToCanvas = this.appendToCanvas.bind(this);
    this.onReceivedChannelData = this.onReceivedChannelData.bind(this);
    this.Logout = this.Logout.bind(this);
    this.Unload = this.Unload.bind(this);
    this.openCreateChannelDialog = this.openCreateChannelDialog.bind(this);
    this.createChannelButtonClicked = this.createChannelButtonClicked.bind(this);
    this.closeCreateChannelDialog = this.closeCreateChannelDialog.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleCreateChannelDialogChannelTypeChange = this.handleCreateChannelDialogChannelTypeChange.bind(this);
    this.resetCreateChannelDialogState = this.resetCreateChannelDialogState.bind(this);
    this.toggleNavigationDrawer = this.toggleNavigationDrawer.bind(this);
    this.navigationDrawerItemClicked = this.navigationDrawerItemClicked.bind(this);
    this.addAttachment = this.addAttachment.bind(this);
    this.removeAttachment = this.removeAttachment.bind(this);

    this.state = {
      CanvasObject: undefined,
      ChannelList: undefined,
      ChannelName: '',
      AttachmentList: [],
      CreateChannelDialogChannelName: '',
      CreateChannelDialogRecipients: {},
      CreateChannelDialogVisible: false,
      CreateChannelDialogChannelType: ChannelType.Default,
      CreateChannelDialogRecipientAvatarSrc: '',
      NavigationDrawerOpen: false
    };

    this.UserDropdownMenuFunctions = { logout: this.Logout };
  }

  async preloadChannel() {
    if (GLOBALS.currentChannel != null && GLOBALS.currentChannel.length < 1) {
      const lastOpenedChannel = localStorage.getItem('lastOpenedChannel');
      if (lastOpenedChannel != null && lastOpenedChannel != 'undefined') {
        GLOBALS.currentChannel = lastOpenedChannel;
        ipcRenderer.send('GETMessages', lastOpenedChannel);
      }
      else if (this.state.ChannelList != null && this.state.ChannelList.state != null && this.state.ChannelList.state.channels != null && this.state.ChannelList.state.channels.length > 0) {
        ipcRenderer.send('GETMessages', this.state.ChannelList.state.channels[0].channelID);
        GLOBALS.currentChannel = this.state.ChannelList.state.channels[0].channelID;
        setDefaultChannel(this.state.ChannelList.state.channels[0].channelID);
      }
    }
    else {
      ipcRenderer.send('GETMessages', GLOBALS.currentChannel);
    }
  }

  initCanvas(canvas: MessageCanvas) {
    if (canvas != null) {
      this.setState({ CanvasObject: canvas });

      ipcRenderer.on('GotMessages', (messages: IMessageProps[], channel_uuid: string) => this.onReceivedChannelData(messages, channel_uuid, false));

      events.on('OnNewMessage', (message: IMessageProps, channel_uuid: string) => this.onReceivedChannelData([message], channel_uuid, true));
      events.on('OnMessageEdit', (message: IMessageProps, channel_uuid: string, message_id: string) => this.onReceivedMessageEdit(channel_uuid, message_id, message));
      events.on('OnMessageDelete', (channel_uuid: string, message_id: string) => this.onReceivedMessageDelete(channel_uuid, message_id));
    }
    else {
      Debug.Error('Failed to initialize MessageCanvas', LogContext.Renderer, 'from ChatPage initialization callback');
    }
  }

  initChannelView(channelList: ChannelView) {
    if (channelList != null) {
      this.setState({ChannelList: channelList });
      ipcRenderer.on('GotUserChannels', (data: string[]) => this.onReceivedChannels(data));

      events.on('OnChannelCreated', (channel_uuid: string) => this.onReceivedChannels([channel_uuid]));
      events.on('OnChannelNewMember', (channel_uuid: string) => this.onReceivedChannels([channel_uuid]));
    }
    else {
      Debug.Error('Failed to initialize ChannelView', LogContext.Renderer, 'from ChatPage initialization callback');
    }
  }

  async onReceivedChannels(data: string[]) {
    for (let channel = 0; channel < data.length; channel++) {
      const c = await ipcRenderer.invoke('GETChannel', data[channel]);
      if (c != undefined) this.addChannel(c);
    }
  }

  onReceivedChannelInfo(channel: IChannelProps) {
    this.addChannel(channel);
  }

  appendToCanvas(message: IMessageProps, isUpdate: boolean) {
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      canvas.append(message, isUpdate);
    }
    else {
      Debug.Error('MessageCanvas is null', LogContext.Renderer, 'when appending message from ChatPage');
    }
  }

  clearCanvas() {
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      canvas.clear();
    }
  }

  addChannel(channel: IChannelProps) {
    const channelList = this.state.ChannelList;
    if (channelList != null) {
      channelList.addChannel(new Channel(channel));
      this.preloadChannel();
    }
    else {
      Debug.Error('ChannelView is null', LogContext.Renderer, 'when appending channel from ChatPage');
    }
  }

  onReceivedChannelData(messages: IMessageProps[], channel_uuid: string, isUpdate: boolean) {
    console.log(messages);
    if (GLOBALS.currentChannel != channel_uuid) return;
    ipcRenderer.invoke('GETChannelName', channel_uuid).then((channelName) => {
      this.setState({ ChannelName: channelName });
    });
    if (!isUpdate)
      this.clearCanvas();

    for (let index = 0; index < messages.length; index++) {
      const message = messages[index];
      if (isUpdate && message.author_UUID != GLOBALS.userData.uuid) {
        const selected = GLOBALS.currentChannel == channel_uuid;
        if (selected && GLOBALS.isFocused) {}
        else if (!selected && GLOBALS.isFocused) new AppNotification({ title: message.author, body: message.content, playSound: true, notificationType: NotificationStatusType.info, notificationAudience: NotificationAudienceType.app }).show();
        else if (selected && !GLOBALS.isFocused) new AppNotification({ title: message.author, body: message.content, playSound: true, notificationType: NotificationStatusType.info, notificationAudience: NotificationAudienceType.none }).show();
        else if (!selected && !GLOBALS.isFocused) new AppNotification({ title: message.author, body: message.content, playSound: true, notificationType: NotificationStatusType.info, notificationAudience: NotificationAudienceType.both }).show();
      }
      this.appendToCanvas(message, isUpdate);
    }
  }

  onReceivedMessageEdit(channel_uuid: string, id: string, message: IMessageProps) {
    if (GLOBALS.currentChannel != channel_uuid) return;
    if (this.state.CanvasObject != null) {
      this.state.CanvasObject.edit(id, message);
    }
  }

  onReceivedMessageDelete(channel_uuid: string, message_id: string) {
    if (GLOBALS.currentChannel != channel_uuid) return;
    if (this.state.CanvasObject != null) {
      this.state.CanvasObject.remove(message_id);
    }
  }

  async sendMessage(message: string) {
    const attachments = this.state.AttachmentList;
    if (message.length > 0 && attachments.length > 0 || message.length < 1 && attachments.length > 0)
    {
      const attachmentIds = [] as string[];
      new Promise((resolve) => {
        attachments.forEach(async (attachment, index, array) => {
          const id = await ipcRenderer.invoke('uploadFile', GLOBALS.currentChannel, JSON.stringify(attachment));
          if (id != null && id.payload != null && id.payload.length > 0) attachmentIds.push(id.payload);
          if (index === array.length - 1) resolve(true);
        });
      }).then(() => {
        ipcRenderer.send('SENDMessage', GLOBALS.currentChannel, message, attachmentIds);
      });
    }
    else if (message.length > 0) {
      ipcRenderer.send('SENDMessage', GLOBALS.currentChannel, message, []);
    }
    this.setState({ AttachmentList: [] });
  }

  handleFormChange(event: React.FormEvent<HTMLInputElement>) {
    // TODO If something breaks check here
    const { name, value } = event.currentTarget;
    if (name == 'CreateChannelDialogRecipients') {
      const usernames = value.split(' ');
      usernames.forEach(async (username: string) => {
        if (this.isValidUsername(username)) {
          const ud = username.split('#')
          await ipcRenderer.invoke('GETUserUUID', ud[0], ud[1]).then((result) => {
            if (result == 'UNKNOWN') return;
            // Change this later to support multiple users for the dialog
            this.setState((prevState: IChatPageState) => {
              prevState.CreateChannelDialogRecipients[username] = result;
              return {
                CreateChannelDialogRecipients: prevState.CreateChannelDialogRecipients,
                CreateChannelDialogRecipientAvatarSrc: `https://api.novastudios.tk/Media/Avatar/${result}?size=64`}
              });
          });
        }
      });
      return;
    }
    this.setState({[name]: value});
  }

  isValidUsername(username: string) {
    return new RegExp(/^([\S]{1,})#([0-9]{4}$)/g).test(username);
  }

  openCreateChannelDialog() {
    this.setState({ CreateChannelDialogVisible: true });
  }

  closeCreateChannelDialog() {
    this.setState({ CreateChannelDialogVisible: false });
  }

  createChannelButtonClicked() {
    const users = Object.values(this.state.CreateChannelDialogRecipients);
    if (users.length == 1)
      ipcRenderer.send('CREATEChannel',  users[0]);
    else
      ipcRenderer.send('CREATEGroupChannel', this.state.CreateChannelDialogChannelName, users);
    this.closeCreateChannelDialog();
  }

  resetCreateChannelDialogState() {
    this.setState({
      CreateChannelDialogChannelName: '',
      CreateChannelDialogRecipients: {} as {[username: string]: string},
      CreateChannelDialogVisible: false,
      CreateChannelDialogChannelType: ChannelType.Default,
      CreateChannelDialogRecipientAvatarSrc: ''
    });
  }

  handleCreateChannelDialogChannelTypeChange(e: SelectChangeEvent<any>) {
    this.setState({ CreateChannelDialogChannelType: e.target.value });
  }

  toggleNavigationDrawer(open?: boolean) {
    if (open != null) {
      this.setState({ NavigationDrawerOpen: open });
    }
    else
    {
      this.setState((prevState: IChatPageState) => {
        return {
          NavigationDrawerOpen: !prevState.NavigationDrawerOpen
       }
      });
    }
  }

  navigationDrawerItemClicked(event: MouseEvent<HTMLLIElement>) {
    switch (event.currentTarget.id) {
      case 'chat':
        new AppNotification({ title: 'Navigation', body: 'Navigating to Chat page', playSound: false, notificationType: NotificationStatusType.info, notificationAudience: NotificationAudienceType.app }).show();
        break;
    }
  }

  addAttachment(attachment: MessageAttachment) {
    this.setState((prevState: IChatPageState) => {
      const newAttachmentList = prevState.AttachmentList;
      newAttachmentList.push(attachment);
      return { AttachmentList: newAttachmentList };
    });
  }

  removeAttachment(id: string) {
    this.setState((prevState: IChatPageState) => {
      const index = prevState.AttachmentList.findIndex((attachment) => {
        return attachment.id == id;
      });

      if (index > -1) {
        prevState.AttachmentList.splice(index, 1);
        return { AttachmentList: prevState.AttachmentList};
      }

      Debug.Warn(`Unable to remove attachment ${id}`, LogContext.Renderer, 'ID not found in attachment list');

      return null;
    });
  }

  Logout() {
    this.Unload();
    RemoveCachedCredentials();
    GLOBALS.loggedOut = true;
    Navigate('/login', null);
  }

  Unload() {
    this.setState({ ChannelList: undefined, CanvasObject: undefined });
    ipcRenderer.removeAllListeners('GotMessages');
    ipcRenderer.removeAllListeners('GotUserChannels');
  }

  componentWillUnmount() {
    this.Unload();
  }

  render() {
    let CreateChannelDialogItems = null;
    let titleString = null;
    switch (this.state.CreateChannelDialogChannelType) {
      case ChannelType.Group:
        CreateChannelDialogItems = (
          <div>
            <FormTextField key='CreateChannelDialogChannelName' id='CreateChannelDialogChannelName' label='Channel Name' description='The new name for the channel (can be changed later).' required onChange={this.handleFormChange}></FormTextField>
            <FormTextField key='CreateChannelDialogRecipients' id='CreateChannelDialogRecipients' label='Recipients' description='Space separated list of the people you are trying to add by usernames and their discriminators. (e.g Eden#1234 Aiden#4321).' required onChange={this.handleFormChange}></FormTextField>
          </div>
        );
        break;
      case ChannelType.Default:
      case ChannelType.User:
      default:
        CreateChannelDialogItems = (
          <div className='CreateChannelDialog_User_Items'>
            <FormTextField key='CreateChannelDialogRecipientsSingle' id='CreateChannelDialogRecipients' label='Recipient' description='The username and discriminator of the person you are trying to add. (e.g Eden#1234)' required onChange={this.handleFormChange}></FormTextField>
            <Avatar src={this.state.CreateChannelDialogRecipientAvatarSrc} className='CreateChannelDialog_User_Avatar'/>
          </div>
        );
        break;
    }

    if (this.state.ChannelName.length > 0) {
      titleString = `${GLOBALS.appName} ${GLOBALS.appVersion} - ${this.state.ChannelName}`;
    }
    else {
      titleString = `${GLOBALS.appName} ${GLOBALS.appVersion}`;
    }

    return (
      <div className='Page Chat_Page_Container'>
        <Helmet>
          <title>{titleString}</title>
        </Helmet>
        <div className='Chat_Page_Body'>
          <div className='Chat_Page_Body_Left'>
            <Header caption='Channels' onClick={() => this.toggleNavigationDrawer(true)} icon={<ListIcon />}>
              <IconButton onClick={this.openCreateChannelDialog}><PlusIcon /></IconButton>
            </Header>
            <ChannelView init={this.initChannelView} />
          </div>
          <div className='Chat_Page_Body_Right'>
            <Header caption={this.state.ChannelName} icon={<ChatIcon />}>
              <UserDropdownMenu menuFunctions={this.UserDropdownMenuFunctions} userData={GLOBALS.userData} />
            </Header>
            <MessageCanvas init={this.initCanvas}/>
            <FileUploadSummary files={this.state.AttachmentList} onRemoveAttachment={this.removeAttachment}/>
            <MessageInput onAddAttachment={this.addAttachment} onMessagePush={this.sendMessage}/>
          </div>
        </div>
        <Drawer className='NavigationDrawer' anchor='left' open={this.state.NavigationDrawerOpen} onClose={() => this.toggleNavigationDrawer(false)}>
          <List className='NavigationDrawerList'>
            <HybridListItem id='chat' text='Chat' icon={<ChatIcon />} onClick={this.navigationDrawerItemClicked} />
          </List>
        </Drawer>
        <Dialog id='createChannelDialog' open={this.state.CreateChannelDialogVisible} TransitionComponent={GrowTransition}>
          <DialogTitle>Create a Channel</DialogTitle>
          <DialogContent>
            <FormDropdown id='CreateChannelDialogType' value={this.state.CreateChannelDialogChannelType} onChange={this.handleCreateChannelDialogChannelTypeChange} label='Channel Type' description='Choose between a single user or group conversation.'>
              <MenuItem value={ChannelType.Default}>User</MenuItem>
              <MenuItem value={ChannelType.Group}>Group</MenuItem>
            </FormDropdown>
            {CreateChannelDialogItems}
          </DialogContent>
          <DialogActions>
            <Button id='cancelButton' onClick={this.closeCreateChannelDialog}>Cancel</Button>
            <Button id='createButton' onClick={this.createChannelButtonClicked}>Create</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
