import React from 'react';
import { Add as PlusIcon, Chat as ChatIcon , List as ListIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import Message from 'renderer/components/Messages/Message';
import MessageCanvas from 'renderer/components/Messages/MessageCanvas';
import { Navigate, ipcRenderer, events, setDefaultChannel, RemoveCachedCredentials } from 'shared/helpers';
import ChannelView from 'renderer/components/Channels/ChannelView';
import Channel from 'renderer/components/Channels/Channel';
import MessageInput from 'renderer/components/Messages/MessageInput';
import Header from 'renderer/components/Header/Header';
import GLOBALS from 'shared/globals'
import { IChannelProps, IChatPageProps, IChatPageState, IMessageProps, IUserDropdownMenuFunctions } from 'types/interfaces';
import UserDropdownMenu from 'renderer/components/UserDropdown/UserDropdownMenu';
import AppNotification from 'renderer/components/Notification/Notification';
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, SelectChangeEvent } from '@mui/material';
import { withStyles } from '@mui/styles';
import { ChannelType, NotificationAudienceType, NotificationStatusType } from 'types/enums';
import { Beforeunload } from 'react-beforeunload';
import FormTextField from 'renderer/components/Form/FormTextField';
import FormDropdown from 'renderer/components/Form/FormDropdown';
import { NotificationStruct } from 'structs/NotificationProps';
import { AppStyles } from 'renderer/AppTheme';

class ChatPage extends React.Component {
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
    this.UnsubscribeEvents = this.UnsubscribeEvents.bind(this);
    this.openCreateChannelDialog = this.openCreateChannelDialog.bind(this);
    this.createChannelButtonClicked = this.createChannelButtonClicked.bind(this);
    this.closeCreateChannelDialog = this.closeCreateChannelDialog.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleCreateChannelDialogChannelTypeChange = this.handleCreateChannelDialogChannelTypeChange.bind(this);
    this.resetCreateChannelDialogState = this.resetCreateChannelDialogState.bind(this);

    this.state = {
      CanvasObject: null as unknown as MessageCanvas,
      ChannelList: null as unknown as ChannelView,
      CreateChannelDialogChannelName: '',
      CreateChannelDialogRecipients: '',
      CreateChannelDialogRecipientUUID: '',
      CreateChannelDialogVisible: false,
      CreateChannelDialogChannelType: ChannelType.Default
    };

    this.UserDropdownMenuFunctions = { logout: this.Logout };
  }

  preloadChannel() {
    if (GLOBALS.currentChannel.length < 1) {
      const lastOpenedChannel = localStorage.getItem('lastOpenedChannel');
      if (lastOpenedChannel != null) {
        GLOBALS.currentChannel = lastOpenedChannel;
        ipcRenderer.send('requestChannelData', lastOpenedChannel);
      } else if (this.state.ChannelList != null && this.state.ChannelList.state != null && this.state.ChannelList.state.channels != null) {
        ipcRenderer.send('requestChannelData', this.state.ChannelList.state.channels[0].channelID);
        GLOBALS.currentChannel = this.state.ChannelList.state.channels[0].channelID;
        setDefaultChannel(this.state.ChannelList.state.channels[0].channelID);
      }
    }
    else {
      ipcRenderer.send('requestChannelData', GLOBALS.currentChannel);
    }
  }

  initCanvas(canvas: MessageCanvas) {
    if (canvas != null) {
      this.setState({CanvasObject: canvas });

      ipcRenderer.on('receivedChannelData', (messages: IMessageProps[]) => this.onReceivedChannelData(messages, "", false));
      ipcRenderer.on('receivedChannelUpdateEvent', (message: IMessageProps, channel_uuid: string) => this.onReceivedChannelData([message], channel_uuid, true));

      ipcRenderer.on('receivedMessageEditEvent', (id: string, data: any) => this.onReceivedMessageEdit(id, data));
      events.on('receivedMessageDeleteEvent', (channel_uuid: string, message_id: string) => this.onReceivedMessageDelete(channel_uuid, message_id));
    }
    else {
      console.error('Message canvas initialization error.')
    }
  }

  initChannelView(channelList: ChannelView) {
    if (channelList != null) {
      this.setState({ChannelList: channelList }/*, () => this.addChannel(JSON.parse('{\'channelName\':\'Main Channel\', \'channelID\':\'0\'}'))*/);
      ipcRenderer.on('receivedChannels', (data: string) => this.onReceivedChannels(JSON.parse(data)));
      ipcRenderer.on('receivedChannelInfo', (data: IChannelProps) => this.onReceivedChannelInfo(data));
      events.on('receivedChannelCreatedEvent', (channel_uuid: string) => this.onReceivedChannels([channel_uuid]));
      events.on('receivedAddedToChannelEvent', (channel_uuid: string) => this.onReceivedChannels([channel_uuid]));
    }
    else {
      console.error('Channel list initialization error.')
    }
  }

  onReceivedChannels(data: string[]) {
    for (let channel = 0; channel < data.length; channel++) {
      //this.addChannel({channelName: data[channel], channelID: data[channel]});
      ipcRenderer.send('requestChannelInfo', data[channel]);
    }
  }

  onReceivedChannelInfo(channel: IChannelProps) {
    console.log(channel);
    if (channel.isGroup)
      this.addChannel(channel);
    else
      this.addChannel(channel);
  }

  appendToCanvas(message: IMessageProps, isUpdate: boolean, refreshList: boolean) {
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      const msgObj = new Message(message);
      canvas.append(msgObj, isUpdate, refreshList);
    }
    else {
      console.error('(When Appending Message) Canvas is null');
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
      console.error('(When Adding Channel) ChannelList is null');
    }
  }

  onReceivedChannelData(messages: IMessageProps[], channel_uuid: string, isUpdate: boolean) {
    if (!isUpdate)
      this.clearCanvas();

    for (let index = 0; index < messages.length; index++) {
      const message = messages[index];
      if (isUpdate && message.author_UUID != GLOBALS.userData.uuid) {
        const selected = GLOBALS.currentChannel == channel_uuid;
        if (selected && GLOBALS.isFocused) {}
        else if (!selected && GLOBALS.isFocused) new AppNotification(new NotificationStruct(message.author, message.content, true, NotificationStatusType.info, NotificationAudienceType.app)).show();
        else if (selected && !GLOBALS.isFocused) new AppNotification(new NotificationStruct(message.author, message.content, true, NotificationStatusType.info, NotificationAudienceType.none)).show();
        else if (!selected && !GLOBALS.isFocused) new AppNotification(new NotificationStruct(message.author, message.content, true, NotificationStatusType.info, NotificationAudienceType.both)).show();
      }
      this.appendToCanvas(message, isUpdate, index == messages.length - 1 && !isUpdate);
    }
  }

  onReceivedMessageEdit(id: string, data: any) {
    const canvas = this.state.CanvasObject;
    console.log(id);
    if (canvas != null) {
      canvas.edit(id, data.content);
    }
  }

  onReceivedMessageDelete(_channel_uuid: string, message_id: string) {
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      canvas.remove(message_id);
    }
  }

  sendMessage(message: string) {
    if (message.length > 0)
    {
      ipcRenderer.send('sendMessageToServer', GLOBALS.currentChannel, message);
    }
  }

  handleFormChange(event: React.FormEvent<HTMLFormElement>) {
    const { name, value } = event.target;
    this.setState({[name]: value});
  }

  openCreateChannelDialog() {
    this.setState({ CreateChannelDialogVisible: true });
  }

  closeCreateChannelDialog() {
    this.setState({ CreateChannelDialogVisible: false });
  }

  createChannelButtonClicked() {
    ipcRenderer.send('createChannel', { channelName: this.state.CreateChannelDialogChannelName, recipients: this.state.CreateChannelDialogRecipients });
    this.closeCreateChannelDialog();
  }

  resetCreateChannelDialogState() {
    this.setState({
      CreateChannelDialogChannelName: '',
      CreateChannelDialogRecipients: '',
      CreateChannelDialogVisible: false,
      CreateChannelDialogChannelType: ChannelType.Default
    });
  }

  handleCreateChannelDialogChannelTypeChange(e: SelectChangeEvent<any>) {
    this.setState({ CreateChannelDialogChannelType: e.target.value });
  }

  Logout() {
    this.UnsubscribeEvents();
    RemoveCachedCredentials();
    Navigate('/login', null);
  }

  UnsubscribeEvents() {
    ipcRenderer.removeAllListeners('receivedChannelData');
    ipcRenderer.removeAllListeners('receivedChannelUpdateEvent');
    ipcRenderer.removeAllListeners('receivedMessageEditEvent');
    ipcRenderer.removeAllListeners('receivedChannels');
    ipcRenderer.removeAllListeners('receivedChannelInfo');
  }

  render() {
    let CreateChannelDialogItems = null;
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
            <Avatar src={this.state.CreateChannelDialogRecipientUUID} className='CreateChannelDialog_User_Avatar'/>
          </div>
        );
        break;
    }

    return (
      <div className='Page Chat_Page_Container'>
        <Helmet>
          <title>Chat</title>
        </Helmet>
        <Beforeunload onBeforeunload={this.UnsubscribeEvents} />
        <div className='Chat_Page_Body'>
          <div className='Chat_Page_Body_Left'>
            <Header caption='Channels' icon={<ListIcon />}>
              <IconButton onClick={this.openCreateChannelDialog}><PlusIcon /></IconButton>
            </Header>
            <ChannelView init={this.initChannelView} />
          </div>
          <div className='Chat_Page_Body_Right'>
            <Header caption='Chat' icon={<ChatIcon />}>
              <UserDropdownMenu menuFunctions={this.UserDropdownMenuFunctions} userData={GLOBALS.userData} />
            </Header>
            <MessageCanvas init={this.initCanvas}/>
            <MessageInput onMessagePush={this.sendMessage}/>
          </div>
        </div>
        <Dialog id='createChannelDialog' open={this.state.CreateChannelDialogVisible}>
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

export default withStyles(AppStyles)(ChatPage);
