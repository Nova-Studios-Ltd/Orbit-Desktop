import { Typography } from '@mui/material';
import React from 'react';
import { MD5 } from 'crypto-js';
import { Debug, Manager } from 'shared/helpers';
import GLOBALS from 'shared/globals';
import Channel from './Channel';
import type { IChannelUpdateProps } from './Channel';

interface IChannelViewProps {
  init: (channelList: ChannelView) => void
}

interface IChannelViewState {
  channels: Channel[],
  selectedChannel: string
}

export default class ChannelView extends React.Component<IChannelViewProps> {
  state: IChannelViewState;

  constructor(props: IChannelViewProps) {
    super(props);
    props.init(this);
    this.addChannel = this.addChannel.bind(this);
    this.updateChannel = this.updateChannel.bind(this);
    this.removeChannel = this.removeChannel.bind(this);
    this.clearChannels = this.clearChannels.bind(this);
    this.isChannelListEmpty = this.isChannelListEmpty.bind(this);
    this.channelClicked = this.channelClicked.bind(this);

    this.state = {
      channels: [],
      selectedChannel: Manager.CurrentChannel || localStorage.getItem('lastOpenedChannel') || ''
    }
  }

  addChannel(channel: Channel) {
    this.setState((prevState: IChannelViewState) => {
      const updatedChannels = prevState.channels;
      updatedChannels.push(channel);
      this.setState({channels: updatedChannels});
    });
  }

  updateChannel(updatedChannelProps: IChannelUpdateProps) {
    this.setState((prevState: IChannelViewState) => {
      if (updatedChannelProps != null && updatedChannelProps.channelID != null) {
        const { channels } = prevState;
        for (let i = 0; i < channels.length; i++) {
          if (channels[i].channelID == updatedChannelProps.channelID)
          {
            if (updatedChannelProps.channelName != null) {
              channels[i].channelName = updatedChannelProps.channelName;
            }
            if (updatedChannelProps.channelIcon) {
              channels[i].channelIcon = `${channels[i].channelIcon}&${Date.now()}`;
            }
            return channels;
          }
        }
      }
      return null;
    });
  }

  removeChannel(channel_uuid: string) {
    this.setState((prevState: IChannelViewState) => {
      const index = prevState.channels.findIndex(e => e.channelID === channel_uuid);
      if (index > -1) {
        prevState.channels.splice(index, 1);
        return { channels: prevState.channels };
      }
      return null;
    });
  }

  clearChannels() {
    this.setState({ channels: [] });
  }

  isChannelListEmpty() {
    return this.state.channels.length < 1;
  }

  getSelectedChannel(channelID: string) {
    return channelID == this.state.selectedChannel;
  }

  channelClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, channelID: string) {
    this.setState({ selectedChannel: channelID });
  }

  render() {
    const channels = this.state.channels.map((c) => (<Channel key={MD5(`${c.channelID}_${c.channelName}_${c.channelIcon}`)} isSelectedChannel={this.getSelectedChannel(c.channelID)} onClick={this.channelClicked} isGroup={c.channelType} channelName={c.channelName} table_Id={c.channelID} channelIcon={c.channelIcon} members={c.channelMembers} owner_UUID={c.channelOwner} />));

    const PromptElement = () => {
      if (this.isChannelListEmpty()) {
        return (
          <div className='AdaptiveText StatusPrompt'>
            <Typography variant='subtitle1'>No Channels</Typography>
            <Typography variant='caption'>Click the + to create a new channel!</Typography>
          </div>
        );
      }

      return null;
    }

    return(
      <div className='ChannelView'>
        {channels}
        <PromptElement />
      </div>
    );
  }
}
