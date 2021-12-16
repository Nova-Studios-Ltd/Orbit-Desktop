import { Typography } from '@mui/material';
import React from 'react';
import type { IChannelViewProps, IChannelViewState } from 'types/interfaces';
import {events}from 'shared/helpers';
import Channel from './Channel';

export default class ChannelView extends React.Component {
  state: IChannelViewState;

  constructor(props: IChannelViewProps) {
    super(props);
    props.init(this);
    this.addChannel = this.addChannel.bind(this);
    this.removeChannel = this.removeChannel.bind(this);
    this.clearChannels = this.clearChannels.bind(this);
    this.isChannelListEmpty = this.isChannelListEmpty.bind(this);

    events.on('OnChannelDeleted', this.removeChannel)

    this.state = {
      channels: [],
    }
  }

  addChannel(channel: Channel) {
    const updatedChannels = this.state.channels;
    updatedChannels.push(channel);
    this.setState({channels: updatedChannels});
  }

  removeChannel(channel_uuid: string) {
    const oldState = this.state;
    const index = oldState.channels.findIndex(e => e.channelID === channel_uuid);
    if (index > -1) {
      oldState.channels.splice(index, 1);
      this.setState({channels: oldState.channels});
    }
  }

  clearChannels() {
    this.setState({ channels: [] });
  }

  isChannelListEmpty() {
    return this.state.channels.length < 1;
  }

  render() {
    const channels = this.state.channels.map((c, key) => (<Channel key={c.channelID} isGroup={c.channelType} channelName={c.channelName} table_Id={c.channelID} channelIcon={c.channelIcon} />));
    const channelEmptyPromptClassNames = this.isChannelListEmpty() ? 'AdaptiveText ChannelEmptyPrompt' : 'AdaptiveText ChannelEmptyPrompt Hidden';

    return(
      <div className='ChannelView'>
        {channels}
        <Typography className={channelEmptyPromptClassNames} variant='subtitle1'>No Channels</Typography>
      </div>
    );
  }
}
