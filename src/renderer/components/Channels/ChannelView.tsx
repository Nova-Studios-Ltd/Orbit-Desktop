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

    this.state = {
      channels: [],
    }
  }

  addChannel(channel: Channel) {
    let updatedChannels = this.state.channels;
    updatedChannels.push(channel);
    this.setState({channels: updatedChannels});
  }

  removeChannel() {

  }

  clearChannels() {
    this.setState({ channels: [] });
  }

  render() {
    const channels = this.state.channels.map((c, key) => (<Channel key={key} channelName={c.channelName} table_Id={c.channelID} channelIcon={c.channelIcon} />));

    return(
      <div className='ChannelView'>
        {channels}
      </div>
    );
  }
}
