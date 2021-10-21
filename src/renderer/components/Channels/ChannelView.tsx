import React from 'react';
import Channel from './Channel';

export default class ChannelView extends React.Component {
  constructor(props: ChannelViewProps) {
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
    console.log(`Channels: ${this.state.channels}`);
    const channels = this.state.channels.map((c, key) => (<Channel key={key} channelName={c.channelName} channelID={c.channelID} />));

    return(
      <div className="Chat_Page_ChannelView">
          {channels}
      </div>
    );
  }
}
