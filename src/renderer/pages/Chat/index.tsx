import React from 'react';
import { Chat as ChatIcon , List as ListIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import Message from 'renderer/components/Messages/Message';
import MessageCanvas from 'renderer/components/Messages/MessageCanvas';
import { Navigate, LoadMessageFeed, ipcRenderer, events, setDefaultChannel } from 'shared/helpers';
import ChannelView from 'renderer/components/Channels/ChannelView';
import Channel from 'renderer/components/Channels/Channel';
import MessageInput from 'renderer/components/Messages/MessageInput';
import Header from 'renderer/components/Header/Header';
import GLOBALS from 'shared/globals'
import { IChatPageProps, IMessageProps, IUserDropdownMenuFunctions } from 'dataTypes/interfaces';
import UserDropdownMenu from 'renderer/components/UserDropdown/UserDropdownMenu';
import AppNotification from 'renderer/components/Notification/Notification';

export default class ChatPage extends React.Component {
  UserDropdownMenuFunctions: IUserDropdownMenuFunctions;

  constructor(props: IChatPageProps) {
    super(props);
    this.initCanvas = this.initCanvas.bind(this);
    this.initChannelView = this.initChannelView.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.appendToCanvas = this.appendToCanvas.bind(this);
    this.onReceivedChannelData = this.onReceivedChannelData.bind(this);
    this.Logout = this.Logout.bind(this);

    this.UserDropdownMenuFunctions = { logout: this.Logout };
  }

  state = {
    CanvasObject: null as unknown as MessageCanvas,
    ChannelList: null as unknown as ChannelView
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

      ipcRenderer.on('receivedChannelData', (data: string) => this.onReceivedChannelData(LoadMessageFeed(data), false));
      ipcRenderer.on('receivedChannelUpdateEvent', (data: string) => this.onReceivedChannelData([JSON.parse(data)], true));

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
      ipcRenderer.on('receivedChannelInfo', (data: string) => this.onReceivedChannelInfo(JSON.parse(data)));
      events.on('receivedChannelCreatedEvent', (channel_uuid: string) => this.onReceivedChannels([channel_uuid]));
    }
    else {
      console.error('Channel list initialization error.')
    }
  }

  onReceivedChannels(data: any) {
    for (let channel = 0; channel < data.length; channel++) {
      //this.addChannel({channelName: data[channel], channelID: data[channel]});
      ipcRenderer.send('requestChannelInfo', data[channel]);
    }
  }

  onReceivedChannelInfo(data: any) {
    if (data.isGroup)
      this.addChannel({channelName: data.groupName, channelID: data.table_Id, channelIcon: data.channelIcon});
    else
      this.addChannel({channelName: data.channelName, channelID: data.table_Id, channelIcon: data.channelIcon});
  }

  appendToCanvas(message: any) {
    const canvas = this.state.CanvasObject;
    if (canvas != null) {
      const msgObj = new Message({ message: message.content, author: message.author, authorUUID: message.author_UUID, messageUUID: message.message_Id, avatarSrc: message.avatar } as IMessageProps);
      canvas.append(msgObj);
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

  addChannel(channel: any) {
    const channelList = this.state.ChannelList;
    if (channelList != null) {
      channelList.addChannel(new Channel({ channelName: channel.channelName, channelID: channel.channelID, channelIcon: channel.channelIcon}));
      this.preloadChannel();
    }
    else {
      console.error('(When Adding Channel) ChannelList is null');
    }
  }

  onReceivedChannelData(messages: JSON[], isUpdate: boolean) {
    if (!isUpdate)
      this.clearCanvas();

    for (let index = 0; index < messages.length; index++) {
      let message = messages[index];
      if (isUpdate && message != null && message.author_UUID != null && message.author_UUID != GLOBALS.CurrentUserUUID) {
        new AppNotification({playSound: true}).show();
      }
      this.appendToCanvas(message);
    }
  }

  onReceivedMessageEdit(id: string, data: any) {
    const canvas = this.state.CanvasObject;
    console.log(id);
    if (canvas != null) {
      canvas.edit(id, data.content);
    }
  }

  onReceivedMessageDelete(channel_uuid: string, message_id: string) {
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

  Logout() {
    ipcRenderer.removeAllListeners('receivedChannelData');
    ipcRenderer.removeAllListeners('receivedChannelUpdateEvent');
    ipcRenderer.removeAllListeners('receivedMessageEditEvent');
    ipcRenderer.removeAllListeners('receivedChannels');
    ipcRenderer.removeAllListeners('receivedChannelInfo');
    Navigate('/login', null);
  }

  render() {
    return (
      <div className='Chat_Page_Container'>
        <Helmet>
          <title>Chat</title>
        </Helmet>
        <div className='Chat_Page_Body'>
          <div className='Chat_Page_Body_Left'>
            <Header caption='Channels' icon={<ListIcon />} />
            <ChannelView init={this.initChannelView} />
          </div>
          <div className='Chat_Page_Body_Right'>
            <Header caption='Chat' icon={<ChatIcon />} misc={<UserDropdownMenu menuFunctions={this.UserDropdownMenuFunctions}/>} />
            <MessageCanvas init={this.initCanvas}/>
            <MessageInput onMessagePush={this.sendMessage}/>
          </div>
        </div>
      </div>
    );
  }
}
