import { Typography } from '@mui/material';
import React from 'react';
import Channel from './Channel';

interface IChannelViewProps {
  init: (channelList: ChannelView) => void
}

interface IChannelViewState {
  channels: Channel[],
}

export default class ChannelView extends React.Component<IChannelViewProps> {
  state: IChannelViewState;

  constructor(props: IChannelViewProps) {
    super(props);
    props.init(this);
    this.addChannel = this.addChannel.bind(this);
    this.removeChannel = this.removeChannel.bind(this);
    this.clearChannels = this.clearChannels.bind(this);
    this.isChannelListEmpty = this.isChannelListEmpty.bind(this);


    this.state = {
      channels: [],
    }
  }

  addChannel(channel: Channel) {
    this.setState((prevState: IChannelViewState) => {
      const updatedChannels = prevState.channels;
      updatedChannels.push(channel);
      this.setState({channels: updatedChannels});
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

  render() {
    const channels = this.state.channels.map((c) => (<Channel key={c.channelID} isGroup={c.channelType} channelName={c.channelName} table_Id={c.channelID} channelIcon={c.channelIcon} members={c.channelMembers} owner_UUID={c.channelOwner} />));

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
