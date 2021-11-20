import { Menu, MenuItem } from '@mui/material';
import React from 'react';
import { IChannelViewProps, IChannelViewState } from 'types/interfaces';
import Channel from './Channel';


export default class ChannelView extends React.Component {
  state: IChannelViewState;

  constructor(props: IChannelViewProps) {
    super(props);
    props.init(this);
    this.addChannel = this.addChannel.bind(this);
    this.removeChannel = this.removeChannel.bind(this);
    this.closeContextMenu = this.closeContextMenu.bind(this);
    this.channelItemClicked = this.channelItemClicked.bind(this);

    this.state = {
      channels: [],
      anchorEl: null,
      open: false
    }
  }

  async menuItemClicked(event: React.ReactElement<any, string | React.JSXElementConstructor<any>>) {
    switch(event.currentTarget.id) {
      case 'edit':
        console.warn("EDIT");
        break;
      case 'delete':
        console.warn("DELETE");
        break;
    }

    this.closeContextMenu();
  }

  closeContextMenu() {
    this.setState({ open: false, anchorEl: null });
  }

  channelItemClicked(event: React.ReactElement<any, string | React.JSXElementConstructor<any>>, channelID: string) {
    this.setState({ open: !this.state.open, anchorEl: event.currentTarget });
  }

  addChannel(channel: Channel) {
    let updatedChannels = this.state.channels;
    updatedChannels.push(channel);
    this.setState({channels: updatedChannels});
  }

  removeChannel() {

  }

  render() {
    const channels = this.state.channels.map((c, key) => (<Channel key={key} clickedCallback={this.channelItemClicked} channelName={c.channelName} channelID={c.channelID} channelIcon={c.channelIcon} />));

    return(
      <div className='Chat_ChannelView'>
        <div>
          {channels}
        </div>
          <Menu
          id='channel-dropdown-menu'
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onClose={this.closeContextMenu}
          >

          <MenuItem id='edit' onClick={this.menuItemClicked}>Edit</MenuItem>
          <MenuItem id='delete' onClick={this.menuItemClicked}>Delete</MenuItem>
        </Menu>
      </div>
    );
  }
}
