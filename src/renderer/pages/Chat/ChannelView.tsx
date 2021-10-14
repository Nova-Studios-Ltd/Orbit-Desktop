import React from 'react';
import Channel from './Channel';

export default class ChannelView extends React.Component {
  constructor(props) {
    super(props);
    this.addChannel = this.addChannel.bind(this);
    this.removeChannel = this.removeChannel.bind(this);
  }

  state = {
    channels: [new Channel({ channelName: "Main Channel", channelID: "0" })]
  }

  addChannel() {

  }

  removeChannel() {

  }

  render() {
    const channels = this.state.channels.map((c, key) => (<Channel channelName={c.channelName} channelID={c.channelID} />));

    return(
      <div className="Chat_Page_ChannelView">
          {channels}
      </div>
    );
  }
}
