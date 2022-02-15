import React from "react";
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, SelectChangeEvent } from "@mui/material";
import { Add as PlusIcon, Chat as ChatIcon , List as ListIcon } from "@mui/icons-material";
import { Helmet } from "react-helmet";

import { Debug, ipcRenderer, events, Manager, RemoveCachedCredentials, Navigate } from "renderer/helpers";

import AppNotification from "renderer/components/Notification/Notification";
import MessageCanvas from "renderer/components/Messages/MessageCanvas";
import ChannelView from "renderer/components/Channels/ChannelView";
import ChannelMemberList from "renderer/components/Channels/ChannelMemberList";
import Channel from "renderer/components/Channels/Channel";
import Message from "renderer/components/Messages/Message";
import MessageInput from "renderer/components/Messages/MessageInput";
import Header from "renderer/components/Header/Header";
import ImageViewer from "renderer/components/Dialogs/ImageViewer";
import FormTextField from "renderer/components/Form/FormTextField";
import FormDropdown from "renderer/components/Form/FormDropdown";
import FileUploadSummary from "renderer/components/Messages/FileUploadSummary";
import MessageAttachment from "structs/MessageAttachment";

import { GrowTransition } from "types/transitions";
import { ChannelType, NotificationAudienceType, NotificationStatusType } from "types/enums";
import type { IMessageProps } from "renderer/components/Messages/Message";
import type { IChannelProps, IChannelUpdateProps } from "renderer/components/Channels/Channel";
import type { Dimensions } from "types/types";

interface IChatPageProps {
  onNavigationDrawerOpened: (event: React.MouseEvent<HTMLButtonElement>, open?: boolean) => void
}

interface IChatPageState {
  Channels: Channel[]
  ChannelName: string,
  SelectedChannel: string,
  IsChannelSelected: boolean,
  Messages: Message[],
  AttachmentList: MessageAttachment[],
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

export default class ChatPage extends React.Component<IChatPageProps, IChatPageState> {
  initLoad: boolean;

  constructor(props: IChatPageProps) {
    super(props);
    this.preloadChannel = this.preloadChannel.bind(this);

    this.addChannel = this.addChannel.bind(this);
    this.clearChannels = this.clearChannels.bind(this);
    this.updateChannel = this.updateChannel.bind(this);
    this.removeChannel = this.removeChannel.bind(this);

    this.sendMessage = this.sendMessage.bind(this);
    this.appendAllMessages = this.appendAllMessages.bind(this);
    this.appendMessage = this.appendMessage.bind(this);
    this.appendMessageTop = this.appendMessageTop.bind(this);
    this.removeMessage = this.removeMessage.bind(this);
    this.editMessage = this.editMessage.bind(this);
    this.clearMessages = this.clearMessages.bind(this);
    this.addAttachment = this.addAttachment.bind(this);
    this.removeAttachment = this.removeAttachment.bind(this);

    this.onReceivedChannels = this.onReceivedChannels.bind(this);
    this.onReceivedChannelInfo = this.onReceivedChannelInfo.bind(this);
    this.onChannelClicked = this.onChannelClicked.bind(this);
    this.onReceivedChannelData = this.onReceivedChannelData.bind(this);
    this.onReceivedMessageEdit = this.onReceivedMessageEdit.bind(this);
    this.onReceivedMessageDelete = this.onReceivedMessageDelete.bind(this);

    this.handleFormChange = this.handleFormChange.bind(this);
    this.createChannelButtonClicked = this.createChannelButtonClicked.bind(this);
    this.handleCreateChannelDialogChannelTypeChange = this.handleCreateChannelDialogChannelTypeChange.bind(this);
    this.onMessageCanvasScroll = this.onMessageCanvasScroll.bind(this);

    this.openCreateChannelDialog = this.openCreateChannelDialog.bind(this);
    this.closeCreateChannelDialog = this.closeCreateChannelDialog.bind(this);
    this.resetCreateChannelDialogState = this.resetCreateChannelDialogState.bind(this);
    this.openImageViewer = this.openImageViewer.bind(this);
    this.closeImageViewer = this.closeImageViewer.bind(this);

    this.getSelectedChannel = this.getSelectedChannel.bind(this);
    this.isValidUsername = this.isValidUsername.bind(this);
    this.setSelectedChannel = this.setSelectedChannel.bind(this);
    this.Logout = this.Logout.bind(this);
    this.Unload = this.Unload.bind(this);

    this.initLoad = true;

    this.state = {
      Channels: [],
      ChannelName: "",
      SelectedChannel: "",
      IsChannelSelected: false,
      Messages: [],
      AttachmentList: [],
      CreateChannelDialogChannelName: "",
      CreateChannelDialogRecipientsRaw: "",
      CreateChannelDialogRecipients: {},
      CreateChannelDialogVisible: false,
      CreateChannelDialogChannelType: ChannelType.Default,
      CreateChannelDialogRecipientAvatarSrc: "",
      ImageViewerOpen: false,
      ImageViewerSrc: "",
      ImageViewerDimensions: {width: 0, height: 0}
    };

    ipcRenderer.on("GotMessages", (messages: IMessageProps[], channel_uuid: string) => this.onReceivedChannelData(messages, channel_uuid, false));
    ipcRenderer.on("GotMessagesWithArgs", (messages: IMessageProps[], channel_uuid: string) => {
      if (Manager.ReadConst<string>("CurrentChannel") != channel_uuid) return;
      this.appendAllMessages(messages);
      this.requestedHistory = false;
    });

    events.on("OnNewMessage", (message: IMessageProps, channel_uuid: string) => this.onReceivedChannelData([message], channel_uuid, true));
    events.on("OnMessageEdit", (message: IMessageProps, channel_uuid: string, message_id: string) => this.onReceivedMessageEdit(channel_uuid, message_id, message));
    events.on("OnMessageDelete", (channel_uuid: string, message_id: string) => this.onReceivedMessageDelete(channel_uuid, message_id));

    ipcRenderer.on("GotUserChannels", (data: string[]) => this.onReceivedChannels(data));
    ipcRenderer.on("ChannelNameUpdated", (channelID: string, channelName: string) => {
      if (channelID != null && channelName != null) this.updateChannel({ channelID, channelName, channelIcon: false });
    });
    ipcRenderer.on("ChannelIconUpdated", (channelID: string) => {
      if (channelID != null) this.updateChannel({ channelID, channelIcon: true });
    });
    ipcRenderer.on("ChannelArchived", (channelID: string) => {
      if (channelID != null) this.removeChannel(channelID);
    });

    events.on("OnChannelCreated", (channel_uuid: string) => this.onReceivedChannels([channel_uuid]));
    events.on("OnChannelDeleted", (channel_uuid: string) => this.removeChannel(channel_uuid));
    events.on("OnChannelNewMember", (channel_uuid: string) => this.onReceivedChannels([channel_uuid]));

    ipcRenderer.send("GETUserChannels");

    this.preloadChannel();
  }

  async preloadChannel() {
    if (Manager.ReadConst<string>("CurrentChannel") != null && Manager.ReadConst<string>("CurrentChannel").length < 1) {
      const lastOpenedChannel = Manager.ReadSetting<string>("DefaultChannel");
      if (lastOpenedChannel != null && lastOpenedChannel != "undefined") {
        Manager.WriteConst("CurrentChannel", lastOpenedChannel);
        ipcRenderer.send("GETMessages", lastOpenedChannel);
      }
      else if (this.state.Channels.length > 0) {
        ipcRenderer.send("GETMessages", this.state.Channels[0].channelID);
        Manager.WriteConst("CurrentChannel", this.state.Channels[0].channelID);
        Manager.WriteSetting("DefaultChannel", this.state.Channels[0].channelID);
      }
    }
    else {
      ipcRenderer.send("GETMessages", Manager.ReadConst<string>("CurrentChannel"));
    }
  }

  /* Operational Functions */

  // Channels

  addChannel(channel: IChannelProps) {
    this.setState((prevState) => {
      const updatedChannels = prevState.Channels;
      updatedChannels.push(new Channel(channel));
      return { Channels: updatedChannels };
    });
  }

  clearChannels() {
    this.setState({ Channels: [] });
  }

  updateChannel(updatedChannelProps: IChannelUpdateProps) {
    this.setState((prevState) => {
      const { Channels } = prevState;
      if (updatedChannelProps != null && updatedChannelProps.channelID != null) {
        for (let i = 0; i < Channels.length; i++) {
          if (Channels[i].channelID == updatedChannelProps.channelID)
          {
            if (updatedChannelProps.channelName != null) {
              Channels[i].channelName = updatedChannelProps.channelName;
            }
            if (updatedChannelProps.channelIcon) {
              Channels[i].channelIcon = `${Channels[i].channelIcon}&${Date.now()}`;
            }
          }
        }
      }
      return { Channels };
    });
  }

  removeChannel(channel_uuid: string) {
    this.setState((prevState) => {
      const index = prevState.Channels.findIndex(e => e.channelID === channel_uuid);
      if (index > -1) {
        prevState.Channels.splice(index, 1);
      }
      return { Channels: prevState.Channels };
    });
  }

  // Messages

  async sendMessage(message: string) {
    const attachments = this.state.AttachmentList;
    if (message.length > 0 && attachments.length > 0 || message.length < 1 && attachments.length > 0)
    {
      ipcRenderer.send("SENDMessage", Manager.ReadConst<string>("CurrentChannel"), message, attachments);
    }
    else if (message.length > 0) {
      ipcRenderer.send("SENDMessage", Manager.ReadConst<string>("CurrentChannel"), message, []);
    }
    this.setState({ AttachmentList: [] });
  }

  appendAllMessages(messages: IMessageProps[]) {
    this.setState((prevState) => {
      let { Messages } = prevState;
      for (let m = 0; m < messages.length; m++) {
        const message = messages[m];
        if (Messages.length > 0) {
          Messages.unshift(new Message(message));
        }
        else {
          Messages = [new Message(message)];
        }
      }
      return ({ Messages });
    });
  }

  appendMessage(message: IMessageProps, isUpdate: boolean) {
    this.setState((prevState) => {
      if (prevState.Messages.length > 0) {
        if (isUpdate) {
          prevState.Messages.push(new Message(message));
        }
        else {
          prevState.Messages.unshift(new Message(message));
        }

        return ({ Messages: prevState.Messages });
      }
      return ({ Messages: [new Message(message)] });
    });
  }

  appendMessageTop(message: IMessageProps) {
    this.setState((prevState) => {
      if (prevState.Messages.length > 0)
      {
        prevState.Messages.unshift(new Message(message));
        return ({ Messages: prevState.Messages });
      }

      return { Messages: [new Message(message)] };
    });
  }

  removeMessage(id: string) {
    this.setState((prevState) => {
      const index = prevState.Messages.findIndex(e => e.message_Id === id);
      if (index > -1) {
        prevState.Messages.splice(index, 1);
      }
      return { Messages: prevState.Messages };
    });
  }

  editMessage(id: string, newMessage: IMessageProps) {
    this.setState((prevState) => {
      const index = prevState.Messages.findIndex(e => e.message_Id == id);

      if (index > -1) {
        const m = prevState.Messages[index];
        m.content = newMessage.content;
        m.edited = true;
        m.editedTimestamp = newMessage.editedTimestamp;
        m.hashedKey = `${m.message_Id}_${m.timestamp}_${m.editedTimestamp}}`;
        prevState.Messages[index] = m;
      }

      return ({
        Messages: prevState.Messages
      });
    });
  }

  clearMessages() {
    this.setState({ Messages: [] });
  }

  addAttachment(attachment: MessageAttachment) {
    this.setState((prevState) => {
      const newAttachmentList = prevState.AttachmentList;
      newAttachmentList.push(attachment);
      return { AttachmentList: newAttachmentList };
    });
  }

  removeAttachment(id: string) {
    this.setState((prevState) => {
      const index = prevState.AttachmentList.findIndex((attachment) => {
        return attachment.id == id;
      });

      if (index > -1) {
        prevState.AttachmentList.splice(index, 1);
        return { AttachmentList: prevState.AttachmentList};
      }

      Debug.Warn(`Unable to remove attachment ${id}`, "ID not found in attachment list");

      return null;
    });
  }

  /* API Event Callbacks */

  async onReceivedChannels(data: string[]) {
    for (let channelIndex = 0; channelIndex < data.length; channelIndex++) {
      ipcRenderer.invoke("GETChannel", data[channelIndex]).then((channel: IChannelProps) => {
        if (channel != undefined) this.addChannel(channel);
      });
    }
  }

  onReceivedChannelInfo(channel: IChannelProps) {
    this.addChannel(channel);
  }

  onChannelClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, channelID: string) {
    this.setState({ SelectedChannel: channelID, IsChannelSelected: true });
  }

  onReceivedChannelData(messages: IMessageProps[], channel_uuid: string, isUpdate: boolean) {
    if (Manager.ReadConst<string>("CurrentChannel") != channel_uuid) return;
    ipcRenderer.invoke("GETChannelName", channel_uuid).then((channelName) => {
      this.setState({ ChannelName: channelName });
    });
    if (!isUpdate) {
      this.clearMessages();
      this.appendAllMessages(messages);
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
      this.appendMessage(message, isUpdate);
    }
  }

  onReceivedMessageEdit(channel_uuid: string, id: string, message: IMessageProps) {
    if (Manager.ReadConst<string>("CurrentChannel") != channel_uuid) return;
    this.editMessage(id, message);
  }

  onReceivedMessageDelete(channel_uuid: string, message_id: string) {
    if (Manager.ReadConst<string>("CurrentChannel") != channel_uuid) return;
    this.removeMessage(message_id);
  }

  /* UI Event Handlers */

  handleFormChange(event: React.FormEvent<HTMLInputElement>) {
    // TODO If something breaks check here
    const { name, value } = event.currentTarget;
    if (name == "CreateChannelDialogRecipients") {
      this.setState({ CreateChannelDialogRecipientsRaw: value }, () => {
        const usernames = value.split(" ");
        usernames.forEach(async (username: string) => {
          if (this.isValidUsername(username)) {
            const ud = username.split("#")
            await ipcRenderer.invoke("GETUserUUID", ud[0], ud[1]).then((result: string) => {
              if (result == "UNKNOWN") return;
              // Change this later to support multiple users for the dialog
              this.setState((prevState) => {
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
    this.setState({ [name]: value }); // Bad practice but it works fine as long as the provided element name/id matches a key in state
  }

  createChannelButtonClicked() {
    const users = Object.values(this.state.CreateChannelDialogRecipients);
    if (users.length == 1)
      ipcRenderer.send("CREATEChannel", users[0]);
    else
      ipcRenderer.send("CREATEGroupChannel", this.state.CreateChannelDialogChannelName, users);
    this.closeCreateChannelDialog();
  }

  handleCreateChannelDialogChannelTypeChange(event: SelectChangeEvent<string>) {
    const channelType = () => {
      switch (event.target.value) {
        case 0:
          return ChannelType.User;
        case 1:
          return ChannelType.Group;
        default:
          return ChannelType.Default;
      }
    }

    this.setState({ CreateChannelDialogChannelType: channelType() });
  }

  requestedHistory: boolean = false;
  onMessageCanvasScroll(yIndex: number, oldestMessageID: string) {
    if (parseInt(oldestMessageID, 10) <= 1) return;
    if (yIndex < 25 && !this.initLoad && !this.requestedHistory) {
      this.requestedHistory = true;
      ipcRenderer.send("GETMessagesWithArgs", Manager.ReadConst<string>("CurrentChannel"), 30, oldestMessageID);
    }
  }

  /* UI Operational Functions */

  openCreateChannelDialog() {
    this.setState({ CreateChannelDialogVisible: true });
  }

  closeCreateChannelDialog() {
    this.resetCreateChannelDialogState();
    this.setState({ CreateChannelDialogVisible: false });
  }

  resetCreateChannelDialogState() {
    this.setState({
      CreateChannelDialogChannelName: "",
      CreateChannelDialogRecipientsRaw: "",
      CreateChannelDialogRecipients: {} as {[username: string]: string},
      CreateChannelDialogVisible: false,
      CreateChannelDialogChannelType: ChannelType.Default,
      CreateChannelDialogRecipientAvatarSrc: ""
    });
  }

  openImageViewer(src?: string, dimensions?: Dimensions) {
    this.setState({ ImageViewerSrc: (src != null ? src : ""), ImageViewerDimensions: (dimensions != null ? dimensions : { width: 0, height: 0 }), ImageViewerOpen: true });
  }

  closeImageViewer() {
    this.setState({ ImageViewerSrc: "", ImageViewerOpen: false });
  }

  /* Other */

  getSelectedChannel() {
    let returnedChannel: Channel | undefined;
    if (this.state.Channels != null && this.state.SelectedChannel != null) {
      this.state.Channels.forEach((channel) => {
        if (channel.channelID === this.state.SelectedChannel) {
          returnedChannel = channel;
        }
      });
    }
    return returnedChannel;
  }

  isValidUsername(username: string) {
    return new RegExp(/^([\S]{1,})#([0-9]{4}$)/g).test(username);
  }

  setSelectedChannel() {

  }

  Logout() {
    this.Unload();
    RemoveCachedCredentials();
    Manager.WriteConst("LoggedOut", true);
    Navigate("/login", null);
  }

  Unload() {
    ipcRenderer.removeAllListeners("GotUserChannels");
    ipcRenderer.removeAllListeners("ChannelNameUpdated");
    ipcRenderer.removeAllListeners("ChannelIconUpdated");
    ipcRenderer.removeAllListeners("ChannelArchived");
    ipcRenderer.removeAllListeners("GotMessages");
    ipcRenderer.removeAllListeners("GotMessagesWithArgs");
    events.removeAllListeners("OnChannelCreated");
    events.removeAllListeners("OnChannelDeleted");
    events.removeAllListeners("OnChannelNewMember");
    events.removeAllListeners("OnNewMessage");
    events.removeAllListeners("OnMessageEdit");
    events.removeAllListeners("OnMessageDelete");
  }

  /* React Component Functions */

  componentWillUnmount() {
    this.Unload();
  }

  render() {
    const CreateChannelDialogElements = () => {
      switch (this.state.CreateChannelDialogChannelType) {
        case ChannelType.Group:
          return (
            <div key="CreateChannelDialogTypeGroup">
              <FormTextField key="CreateChannelDialogChannelName" id="CreateChannelDialogChannelName" label="Channel Name" description="The new name for the channel (can be changed later)." required value={this.state.CreateChannelDialogChannelName} onChange={this.handleFormChange} />
              <FormTextField key="CreateChannelDialogRecipients" id="CreateChannelDialogRecipients" label="Recipients" description="Space separated list of the people you are trying to add by usernames and their discriminators. (e.g Eden#1234 Aiden#4321)." required value={this.state.CreateChannelDialogRecipientsRaw} onChange={this.handleFormChange} />
            </div>
          );
        case ChannelType.Default:
        case ChannelType.User:
        default:
          return (
            <div key="CreateChannelDialogTypeSingle" className="CreateChannelDialog_User_Items">
              <FormTextField key="CreateChannelDialogRecipientsSingle" id="CreateChannelDialogRecipients" label="Recipient" description="The username and discriminator of the person you are trying to add. (e.g Eden#1234)" required autoFocus value={this.state.CreateChannelDialogRecipientsRaw} onChange={this.handleFormChange} />
              <Avatar src={this.state.CreateChannelDialogRecipientAvatarSrc} className="CreateChannelDialog_User_Avatar"/>
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
      <div className="Page Chat_Page_Container">
        <Helmet>
          <title>{titleString}</title>
        </Helmet>
        <div className="Chat_Page_Body">
          <div className="Chat_Page_Body_Left">
            <Header caption="Channels" onClick={this.props.onNavigationDrawerOpened} icon={<ListIcon />}>
              <IconButton onClick={this.openCreateChannelDialog}><PlusIcon /></IconButton>
            </Header>
            <ChannelView channels={this.state.Channels} selectedChannel={this.state.SelectedChannel} onChannelClicked={this.onChannelClicked} />
            <ChannelMemberList channel={this.getSelectedChannel()}/>
          </div>
          <div className="Chat_Page_Body_Right">
            <Header caption={this.state.ChannelName} icon={<ChatIcon />} />
            <MessageCanvas messages={this.state.Messages} isChannelSelected={this.state.IsChannelSelected} onImageClick={this.openImageViewer} onCanvasScroll={this.onMessageCanvasScroll} />
            <FileUploadSummary files={this.state.AttachmentList} onRemoveAttachment={this.removeAttachment}/>
            <MessageInput onAddAttachment={this.addAttachment} onMessagePush={this.sendMessage}/>
          </div>
        </div>
        <ImageViewer src={this.state.ImageViewerSrc} dimensions={this.state.ImageViewerDimensions} open={this.state.ImageViewerOpen} onDismiss={this.closeImageViewer} />
        <Dialog id="createChannelDialog" open={this.state.CreateChannelDialogVisible} TransitionComponent={GrowTransition}>
          <DialogTitle>Create a Channel</DialogTitle>
          <DialogContent>
            <FormDropdown id="CreateChannelDialogType" value={this.state.CreateChannelDialogChannelType.toString()} onChange={this.handleCreateChannelDialogChannelTypeChange} label="Channel Type" description="Choose between a single user or group conversation.">
              <MenuItem value={ChannelType.User}>User</MenuItem>
              <MenuItem value={ChannelType.Group}>Group</MenuItem>
            </FormDropdown>
            {CreateChannelDialogElements()}
          </DialogContent>
          <DialogActions>
            <Button id="cancelButton" onClick={this.closeCreateChannelDialog}>Cancel</Button>
            <Button id="createButton" onClick={this.createChannelButtonClicked}>Create</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
