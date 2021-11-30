import { Typography } from '@mui/material';
import React from 'react';
import type { IChannelViewProps, IChannelViewState } from 'types/interfaces';
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

    this.state = {
      channels: [],
    }
  }

  addChannel(channel: Channel) {
    const updatedChannels = this.state.channels;
    updatedChannels.push(channel);
    this.setState({channels: updatedChannels});
  }

  removeChannel() {

  }

  clearChannels() {
    this.setState({ channels: [] });
  }

  isChannelListEmpty() {
    return this.state.channels.length < 1;
  }

  render() {
    const channels = this.state.channels.map((channelProps, key) => (<Channel key={key} {...channelProps} />));
    const channelEmptyPromptClassNames = this.isChannelListEmpty() ? 'AdaptiveText ChannelEmptyPrompt' : 'AdaptiveText ChannelEmptyPrompt Hidden';

    return(
      <div className='ChannelView'>
        {channels}
        <Typography className={channelEmptyPromptClassNames} variant='subtitle1'>No Channels</Typography>
      </div>
    );
  }
}
