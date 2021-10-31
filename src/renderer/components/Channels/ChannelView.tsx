import React from 'react';
import { IChannelViewProps } from 'dataTypes/interfaces';
import Channel from './Channel';


export default class ChannelView extends React.Component {
  constructor(props: IChannelViewProps) {
    super(props);
    props.init(this);
    this.addChannel = this.addChannel.bind(this);
    this.removeChannel = this.removeChannel.bind(this);
  }

  state = {
    channels: [] as Channel[],
  }

  addChannel(channel: Channel) {
    let updatedChannels = this.state.channels;
    updatedChannels.push(channel);
    this.setState({channels: updatedChannels});
  }

  removeChannel() {

  }

  render() {
    const channels = this.state.channels.map((c, key) => (<Channel key={key} channelName={c.channelName} channelID={c.channelID} channelIcon={c.channelIcon} />));

    return(
      <div className='Chat_ChannelView'>
          {channels}
      </div>
    );
  }
}
