import React from 'react';
import { Add as PlusIcon, Chat as ChatIcon , List as ListIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import MessageCanvas from 'renderer/components/Messages/MessageCanvas';
import { Debug, ipcRenderer, events, setDefaultChannel, Manager, RemoveCachedCredentials, Navigate } from 'renderer/helpers';
import ChannelView from 'renderer/components/Channels/ChannelView';
import Channel from 'renderer/components/Channels/Channel';
import MessageInput from 'renderer/components/Messages/MessageInput';
import Header from 'renderer/components/Header/Header';
import AppNotification from 'renderer/components/Notification/Notification';
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, SelectChangeEvent } from '@mui/material';
import { ChannelType, NotificationAudienceType, NotificationStatusType } from 'types/enums';
import FormTextField from 'renderer/components/Form/FormTextField';
import FormDropdown from 'renderer/components/Form/FormDropdown';
import { GrowTransition } from 'types/transitions';
import MessageAttachment from 'structs/MessageAttachment';
import FileUploadSummary from 'renderer/components/Messages/FileUploadSummary';
import type { IMessageProps } from 'renderer/components/Messages/Message';
import type { IChannelProps, IChannelUpdateProps } from 'renderer/components/Channels/Channel';
import ImageViewer from 'renderer/components/Dialogs/ImageViewer';
import type { Dimensions } from 'types/types';

interface IChatPageProps {
  onNavigationDrawerOpened: (event: React.MouseEvent<HTMLButtonElement>, open?: boolean) => void
}

interface IChatPageState {
  CanvasObject?: MessageCanvas,
  Channels: Channel[]
  ChannelName: string,
  IsChannelSelected: boolean,
  AttachmentList: Array<MessageAttachment>,
  CreateChannelDialogChannelName: string,
  CreateChannelDialogRecipientsRaw: string,
  CreateChannelDialogRecipients: {[username: string]: string},
  CreateChannelDialogVisible: boolean,
  CreateChannelDialogChannelType: ChannelType,
  CreateChannelDialogRecipientAvatarSrc: string,
  ImageViewerOpen: boolean,
  ImageViewerSrc: string,
  ImageViewerDimensions: Dimensions
}

export default class ChatPage extends React.Component<IChatPageProps> {
  state: IChatPageState;
  initLoad: boolean;

  constructor(props: IChatPageProps) {
    super(props);
    this.initCanvas = this.initCanvas.bind(this);
    this.appendAllToCanvas = this.appendAllToCanvas.bind(this);
    this.addChannel = this.addChannel.bind(this);
    this.updateChannel = this.updateChannel.bind(this);
    this.removeChannel = this.removeChannel.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.onReceivedChannelData = this.onReceivedChannelData.bind(this);
    this.Unload = this.Unload.bind(this);
    this.openCreateChannelDialog = this.openCreateChannelDialog.bind(this);
    this.createChannelButtonClicked = this.createChannelButtonClicked.bind(this);
    this.closeCreateChannelDialog = this.closeCreateChannelDialog.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleCreateChannelDialogChannelTypeChange = this.handleCreateChannelDialogChannelTypeChange.bind(this);
    this.resetCreateChannelDialogState = this.resetCreateChannelDialogState.bind(this);
    this.addAttachment = this.addAttachment.bind(this);
    this.removeAttachment = this.removeAttachment.bind(this);
    this.openImageViewer = this.openImageViewer.bind(this);
    this.closeImageViewer = this.closeImageViewer.bind(this);
    this.onMessageCanvasScroll = this.onMessageCanvasScroll.bind(this);

    this.initLoad = true;

    this.state = {
      CanvasObject: undefined,
      Channels: [],
      ChannelName: '',
      IsChannelSelected: false,
      AttachmentList: [],
      CreateChannelDialogChannelName: '',
      CreateChannelDialogRecipientsRaw: '',
      CreateChannelDialogRecipients: {},
      CreateChannelDialogVisible: false,
      CreateChannelDialogChannelType: ChannelType.Default,
      CreateChannelDialogRecipientAvatarSrc: '',
      ImageViewerOpen: false,
      ImageViewerSrc: '',
      ImageViewerDimensions: {width: 0, height: 0}
    };
  }

  componentDidMount() {
    ipcRenderer.on('GotUserChannels', (data: string[]) => this.onReceivedChannels(data));
    ipcRenderer.on('ChannelNameUpdated', (channelID: string, channelName: string) => {
      if (channelID != null && channelName != null) this.updateChannel({ channelID, channelName, channelIcon: false });
    });
    ipcRenderer.on('ChannelIconUpdated', (channelID: string) => {
      if (channelID != null) this.updateChannel({ channelID, channelIcon: true });
    });
    ipcRenderer.on('ChannelArchived', (channelID: string) => {
      if (channelID != null) this.removeChannel(channelID);
    });

    events.on('OnChannelCreated', (channel_uuid: string) => this.onReceivedChannels([channel_uuid]));
    events.on('OnChannelDeleted', (channel_uuid: string) => this.removeChannel(channel_uuid));
    events.on('OnChannelNewMember', (channel_uuid: string) => this.onReceivedChannels([channel_uuid]));

    this.preloadChannel();
  }

  async preloadChannel() {
    if (Manager.ReadConst<string>("CurrentChannel") != null && Manager.ReadConst<string>("CurrentChannel").length < 1) {
      const lastOpenedChannel = Manager.ReadSetting<string>("DefaultChannel");
      if (lastOpenedChannel != null && lastOpenedChannel != 'undefined') {
        Manager.WriteConst("CurrentChannel", lastOpenedChannel);
        ipcRenderer.send('GETMessages', lastOpenedChannel);
      }
      else if (this.state.Channels.length > 0) {
        ipcRenderer.send('GETMessages', this.state.Channels[0].channelID);
        Manager.WriteConst("CurrentChannel", this.state.Channels[0].channelID);
        setDefaultChannel(this.state.Channels[0].channelID);
      }
    }
    else {
      ipcRenderer.send('GETMessages', Manager.ReadConst<string>("CurrentChannel"));
    }
  }

  initCanvas(canvas: MessageCanvas) {
    if (canvas != null) {
      this.setState({ CanvasObject: canvas });

      ipcRenderer.on('GotMessages', (messages: IMessageProps[], channel_uuid: string) => this.onReceivedChannelData(messages, channel_uuid, false));
      ipcRenderer.on('GotMessagesWithArgs', (messages: IMessageProps[], channel_uuid: string) => {
        if (Manager.ReadConst<string>("CurrentChannel") != channel_uuid) return;
        this.appendAllToCanvas(messages);
        this.requestedHistory = false;
      });

      events.on('OnNewMessage', (message: IMessageProps, channel_uuid: string) => this.onReceivedChannelData([message], channel_uuid, true));
      events.on('OnMessageEdit', (message: IMessageProps, channel_uuid: string, message_id: string) => this.onReceivedMessageEdit(channel_uuid, message_id, message));
      events.on('OnMessageDelete', (channel_uuid: string, message_id: string) => this.onReceivedMessageDelete(channel_uuid, message_id));
    }
    else {
      Debug.Error('Failed to initialize MessageCanvas', 'from ChatPage initialization callback');
    }
  }

  async onReceivedChannels(data: string[]) {
    for (let channel = 0; channel < data.length; channel++) {
      const c = await ipcRenderer.invoke('GETChannel', data[channel]);
      if (c != undefined) this.addChannel(c);
    }
  }

  onReceivedChannelInfo(channel: Channel) {
    this.addChannel(channel);
  }

  addChannel(channel: Channel) {
    this.setState((prevState: IChatPageState) => {
      const updatedChannels = prevState.Channels;
      updatedChannels.push(channel);
      this.setState({ Channels: updatedChannels });
    });
  }

  clearChannels() {
    this.setState({ Channels: [] });
  }

  updateChannel(updatedChannelProps: IChannelUpdateProps) {
    this.setState((prevState: IChatPageState) => {
      if (updatedChannelProps != null && updatedChannelProps.channelID != null) {
        const { Channels } = prevState;
        for (let i = 0; i < Channels.length; i++) {
          if (Channels[i].channelID == updatedChannelProps.channelID)
          {
            if (updatedChannelProps.channelName != null) {
              Channels[i].channelName = updatedChannelProps.channelName;
            }
            if (updatedChannelProps.channelIcon) {
              Channels[i].channelIcon = `${Channels[i].channelIcon}&${Date.now()}`;
            }
            return Channels;
          }
        }
      }
      return null;
    });
  }

  removeChannel(channel_uuid: string) {
    this.setState((prevState: IChatPageState) => {
      const index = prevState.Channels.findIndex(e => e.channelID === channel_uuid);
      if (index > -1) {
        prevState.Channels.splice(index, 1);
        return { channels: prevState.Channels };
      }
      return null;
    });
  }

  appendToCanvas(message: IMessageProps, isUpdate: boolean) {
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      canvas.append(message, isUpdate);
    }
    else {
      Debug.Error('MessageCanvas is null', 'when appending message from ChatPage');
    }
  }

  appendAllToCanvas(messages: IMessageProps[]) {
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      canvas.appendAll(messages);
    }
    else {
      Debug.Error('MessageCanvas is null', 'when appending messages from ChatPage');
    }
  }

  clearCanvas() {
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      canvas.clear();
    }
  }

  onReceivedChannelData(messages: IMessageProps[], channel_uuid: string, isUpdate: boolean) {
    console.log(messages);
    this.setState({ IsChannelSelected: true });
    if (Manager.ReadConst<string>("CurrentChannel") != channel_uuid) return;
    ipcRenderer.invoke('GETChannelName', channel_uuid).then((channelName) => {
      this.setState({ ChannelName: channelName });
    });
    if (!isUpdate) {
      this.clearCanvas();
      this.appendAllToCanvas(messages);
      this.initLoad = false;
      return;
    }

    for (let index = 0; index < messages.length; index++) {
      const message = messages[index];
      if (isUpdate && message.author_UUID != Manager.UserData.uuid) {
        const selected = Manager.ReadConst<string>("CurrentChannel") == channel_uuid;
        if (selected && Manager.ReadConst<boolean>("IsFocused")) {}
        else if (!selected && Manager.ReadConst<boolean>("IsFocused")) new AppNotification({ title: message.author, body: message.content, playSound: true, notificationType: NotificationStatusType.info, notificationAudience: NotificationAudienceType.app }).show();
        else if (selected && !Manager.ReadConst<boolean>("IsFocused")) new AppNotification({ title: message.author, body: message.content, playSound: true, notificationType: NotificationStatusType.info, notificationAudience: NotificationAudienceType.none }).show();
        else if (!selected && !Manager.ReadConst<boolean>("IsFocused")) new AppNotification({ title: message.author, body: message.content, playSound: true, notificationType: NotificationStatusType.info, notificationAudience: NotificationAudienceType.both }).show();
      }
      this.appendToCanvas(message, isUpdate);
    }
  }

  onReceivedMessageEdit(channel_uuid: string, id: string, message: IMessageProps) {
    if (Manager.ReadConst<string>("CurrentChannel") != channel_uuid) return;
    if (this.state.CanvasObject != null) {
      this.state.CanvasObject.edit(id, message);
    }
  }

  onReceivedMessageDelete(channel_uuid: string, message_id: string) {
    if (Manager.ReadConst<string>("CurrentChannel") != channel_uuid) return;
    if (this.state.CanvasObject != null) {
      this.state.CanvasObject.remove(message_id);
    }
  }

  async sendMessage(message: string) {
    const attachments = this.state.AttachmentList;
    if (message.length > 0 && attachments.length > 0 || message.length < 1 && attachments.length > 0)
    {
      ipcRenderer.send('SENDMessage', Manager.ReadConst<string>("CurrentChannel"), message, attachments);
    }
    else if (message.length > 0) {
      ipcRenderer.send('SENDMessage', Manager.ReadConst<string>("CurrentChannel"), message, []);
    }
    this.setState({ AttachmentList: [] });
  }

  handleFormChange(event: React.FormEvent<HTMLInputElement>) {
    // TODO If something breaks check here
    const { name, value } = event.currentTarget;
    if (name == 'CreateChannelDialogRecipients') {
      this.setState({ CreateChannelDialogRecipientsRaw: value }, () => {
        const usernames = value.split(' ');
        usernames.forEach(async (username: string) => {
          if (this.isValidUsername(username)) {
            const ud = username.split('#')
            await ipcRenderer.invoke('GETUserUUID', ud[0], ud[1]).then((result: string) => {
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
    this.resetCreateChannelDialogState();
    this.setState({ CreateChannelDialogVisible: false });
  }

  createChannelButtonClicked() {
    const users = Object.values(this.state.CreateChannelDialogRecipients);
    if (users.length == 1)
      ipcRenderer.send('CREATEChannel', users[0]);
    else
      ipcRenderer.send('CREATEGroupChannel', this.state.CreateChannelDialogChannelName, users);
    this.closeCreateChannelDialog();
  }

  resetCreateChannelDialogState() {
    this.setState({
      CreateChannelDialogChannelName: '',
      CreateChannelDialogRecipientsRaw: '',
      CreateChannelDialogRecipients: {} as {[username: string]: string},
      CreateChannelDialogVisible: false,
      CreateChannelDialogChannelType: ChannelType.Default,
      CreateChannelDialogRecipientAvatarSrc: ''
    });
  }

  handleCreateChannelDialogChannelTypeChange(event: SelectChangeEvent<string>) {
    this.setState({ CreateChannelDialogChannelType: event.target.value });
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

      Debug.Warn(`Unable to remove attachment ${id}`, 'ID not found in attachment list');

      return null;
    });
  }

  requestedHistory: boolean = false;
  onMessageCanvasScroll(yIndex: number, oldestMessageID: string) {
    if (parseInt(oldestMessageID, 10) <= 1) return;
    if (yIndex < 25 && !this.initLoad && !this.requestedHistory) {
      this.requestedHistory = true;
      ipcRenderer.send('GETMessagesWithArgs', Manager.ReadConst<string>("CurrentChannel"), 30, oldestMessageID);
    }
  }

  setSelectedChannel() {

  }

  openImageViewer(src?: string, dimensions?: Dimensions) {
    this.setState({ ImageViewerSrc: (src != null ? src : ''), ImageViewerDimensions: (dimensions != null ? dimensions : { width: 0, height: 0 }), ImageViewerOpen: true });
  }

  closeImageViewer() {
    this.setState({ ImageViewerSrc: '', ImageViewerOpen: false });
  }

  Logout() {
    this.Unload();
    RemoveCachedCredentials();
    Manager.WriteConst("LoggedOut", true);
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
    const CreateChannelDialogElements = () => {
      switch (this.state.CreateChannelDialogChannelType) {
        case ChannelType.Group:
          return (
            <div key='CreateChannelDialogTypeGroup'>
              <FormTextField key='CreateChannelDialogChannelName' id='CreateChannelDialogChannelName' label='Channel Name' description='The new name for the channel (can be changed later).' required value={this.state.CreateChannelDialogChannelName} onChange={this.handleFormChange} />
              <FormTextField key='CreateChannelDialogRecipients' id='CreateChannelDialogRecipients' label='Recipients' description='Space separated list of the people you are trying to add by usernames and their discriminators. (e.g Eden#1234 Aiden#4321).' required value={this.state.CreateChannelDialogRecipientsRaw} onChange={this.handleFormChange} />
            </div>
          );
        case ChannelType.Default:
        case ChannelType.User:
        default:
          return (
            <div key='CreateChannelDialogTypeSingle' className='CreateChannelDialog_User_Items'>
              <FormTextField key='CreateChannelDialogRecipientsSingle' id='CreateChannelDialogRecipients' label='Recipient' description='The username and discriminator of the person you are trying to add. (e.g Eden#1234)' required autoFocus value={this.state.CreateChannelDialogRecipientsRaw} onChange={this.handleFormChange} />
              <Avatar src={this.state.CreateChannelDialogRecipientAvatarSrc} className='CreateChannelDialog_User_Avatar'/>
            </div>
          );
      }
    }

    const titleString = (() => {
      if (this.state.ChannelName.length > 0) {
        return `${Manager.AppName} ${Manager.AppVersion} - ${this.state.ChannelName}`;
      }

      return `${Manager.AppName} ${Manager.AppVersion}`;
    })();

    return (
      <div className='Page Chat_Page_Container'>
        <Helmet>
          <title>{titleString}</title>
        </Helmet>
        <div className='Chat_Page_Body'>
          <div className='Chat_Page_Body_Left'>
            <Header caption='Channels' onClick={this.props.onNavigationDrawerOpened} icon={<ListIcon />}>
              <IconButton onClick={this.openCreateChannelDialog}><PlusIcon /></IconButton>
            </Header>
            <ChannelView channels={this.state.Channels} />
          </div>
          <div className='Chat_Page_Body_Right'>
            <Header caption={this.state.ChannelName} icon={<ChatIcon />} />
            <MessageCanvas init={this.initCanvas} isChannelSelected={this.state.IsChannelSelected} onImageClick={this.openImageViewer} onCanvasScroll={this.onMessageCanvasScroll} />
            <FileUploadSummary files={this.state.AttachmentList} onRemoveAttachment={this.removeAttachment}/>
            <MessageInput onAddAttachment={this.addAttachment} onMessagePush={this.sendMessage}/>
          </div>
        </div>
        <ImageViewer src={this.state.ImageViewerSrc} dimensions={this.state.ImageViewerDimensions} open={this.state.ImageViewerOpen} onDismiss={this.closeImageViewer} />
        <Dialog id='createChannelDialog' open={this.state.CreateChannelDialogVisible} TransitionComponent={GrowTransition}>
          <DialogTitle>Create a Channel</DialogTitle>
          <DialogContent>
            <FormDropdown id='CreateChannelDialogType' value={this.state.CreateChannelDialogChannelType.toString()} onChange={this.handleCreateChannelDialogChannelTypeChange} label='Channel Type' description='Choose between a single user or group conversation.'>
              <MenuItem value={ChannelType.Default}>User</MenuItem>
              <MenuItem value={ChannelType.Group}>Group</MenuItem>
            </FormDropdown>
            {CreateChannelDialogElements()}
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
