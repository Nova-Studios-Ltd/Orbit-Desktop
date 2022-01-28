import { Tab, Tabs, Typography } from '@mui/material';
import React from 'react';
import { MD5 } from 'crypto-js';
import { Debug, Manager } from 'renderer/helpers';
import { ChannelType } from 'types/enums';
import Channel from './Channel';

interface IChannelViewProps {
  channels: Channel[]
}

interface IChannelViewState {
  selectedChannel: string,
  selectedTab: number
}

export default class ChannelView extends React.Component<IChannelViewProps> {
  state: IChannelViewState;

  constructor(props: IChannelViewProps) {
    super(props);
    this.clearChannels = this.clearChannels.bind(this);
    this.isChannelListEmpty = this.isChannelListEmpty.bind(this);
    this.channelClicked = this.channelClicked.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);

    this.state = {
      selectedChannel: Manager.ReadConst<string>("CurrentChannel") || Manager.ReadSetting<string>("DefaultChannel") || '',
      selectedTab: 0
    }
  }

  handleTabChange(event: React.SyntheticEvent, newValue: number) {
    this.setState({ selectedTab: newValue });
  }

  isChannelListEmpty() {
    return this.props.channels.length < 1;
  }

  getSelectedChannel(channelID: string) {
    return channelID == this.state.selectedChannel;
  }

  channelClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, channelID: string) {
    this.setState({ selectedChannel: channelID });
  }

  render() {
    const channels = this.props.channels.map((c) => {
      if (this.state.selectedTab == 0 ) {
        if (c.channelType == ChannelType.User) return (<Channel key={MD5(`${c.channelID}_${c.channelName}_${c.channelIcon}`).toString()} isSelectedChannel={this.getSelectedChannel(c.channelID)} onClick={this.channelClicked} isGroup={c.channelType} channelName={c.channelName} table_Id={c.channelID} channelIcon={c.channelIcon} members={c.channelMembers} owner_UUID={c.channelOwner} />);
      }
      else if (this.state.selectedTab == 1) {
        if (c.channelType == ChannelType.Group) return (<Channel key={MD5(`${c.channelID}_${c.channelName}_${c.channelIcon}`).toString()} isSelectedChannel={this.getSelectedChannel(c.channelID)} onClick={this.channelClicked} isGroup={c.channelType} channelName={c.channelName} table_Id={c.channelID} channelIcon={c.channelIcon} members={c.channelMembers} owner_UUID={c.channelOwner} />);
      }
      return null;
    });

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
        <Tabs className='ChannelViewTabBar' variant='fullWidth' value={this.state.selectedTab} onChange={this.handleTabChange}>
          <Tab label='Private DMs' value={0} />
          <Tab label='Group DMs' value={1} />
        </Tabs>
        <div className='ChannelsContainer'>
          {channels}
        </div>
        <PromptElement />
      </div>
    );
  }
}
