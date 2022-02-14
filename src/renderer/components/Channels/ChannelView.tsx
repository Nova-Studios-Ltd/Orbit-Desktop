import { Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import { MD5 } from "crypto-js";
import { ChannelType } from "types/enums";
import Channel from "./Channel";
import ChannelMemberList from "./ChannelMemberList";

interface IChannelViewProps {
  channels: Channel[],
  selectedChannel?: string,
  onChannelClicked?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, channelID: string) => void
}

interface IChannelViewState {
  selectedChannelObject: Channel | undefined
  selectedTab: number
}

export default class ChannelView extends React.Component<IChannelViewProps, IChannelViewState> {

  constructor(props: IChannelViewProps) {
    super(props);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.isChannelListEmpty = this.isChannelListEmpty.bind(this);
    this.isChannelSelected = this.isChannelSelected.bind(this);
    this.getSelectedChannel = this.getSelectedChannel.bind(this);
    this.channelClicked = this.channelClicked.bind(this);

    this.state = {
      selectedChannelObject: undefined,
      selectedTab: 0
    }
  }

  handleTabChange(_event: React.SyntheticEvent, newValue: number) {
    this.setState({ selectedTab: newValue });
  }

  isChannelListEmpty() {
    return this.props.channels.length < 1;
  }

  isChannelSelected(channelID: string) {
    if (this.props.selectedChannel != null) return channelID == this.props.selectedChannel;
    return false;
  }

  getSelectedChannel() {
    let returnedChannel: Channel | undefined;
    if (this.props.channels != null && this.props.selectedChannel != null) {
      this.props.channels.forEach((channel) => {
        if (channel.channelID === this.props.selectedChannel) {
          returnedChannel = channel;
        }
      });
    }
    return returnedChannel;
  }

  channelClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, channelID: string) {
    if (this.props.onChannelClicked != null) {
      this.props.onChannelClicked(event, channelID);
    }
  }

  componentDidUpdate(prevProps: IChannelViewProps) {
    if (this.props.selectedChannel != null && this.props.selectedChannel !== prevProps.selectedChannel) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ selectedChannelObject: this.getSelectedChannel() });
    }
  }

  render() {
    const channels = this.props.channels.map((c) => {
      if (this.state.selectedTab == 0) {
        if (c.channelType == ChannelType.User) return (<Channel key={MD5(`${c.channelID}_${c.channelName}_${c.channelIcon}`).toString()} isSelected={this.isChannelSelected(c.channelID)} onClick={this.channelClicked} isGroup={c.channelType} channelName={c.channelName} table_Id={c.channelID} channelIcon={c.channelIcon} members={c.channelMembers} owner_UUID={c.channelOwner} />);
      }
      else if (this.state.selectedTab == 1) {
        if (c.channelType == ChannelType.Group) return (<Channel key={MD5(`${c.channelID}_${c.channelName}_${c.channelIcon}`).toString()} isSelected={this.isChannelSelected(c.channelID)} onClick={this.channelClicked} isGroup={c.channelType} channelName={c.channelName} table_Id={c.channelID} channelIcon={c.channelIcon} members={c.channelMembers} owner_UUID={c.channelOwner} />);
      }
      return null;
    });

    const PromptElement = () => {
      if (this.isChannelListEmpty()) {
        return (
          <div className="AdaptiveText StatusPrompt">
            <Typography variant="subtitle1">No Channels</Typography>
            <Typography variant="caption">Click the + to create a new channel!</Typography>
          </div>
        );
      }

      return null;
    }

    return (
      <div className="ChannelView">
        <Tabs className="ChannelViewTabBar" variant="fullWidth" value={this.state.selectedTab} onChange={this.handleTabChange}>
          <Tab label="Private DMs" value={0} />
          <Tab label="Group DMs" value={1} />
        </Tabs>
        <div className="ChannelsContainer">
          {channels}
        </div>
        <ChannelMemberList channel={this.state.selectedChannelObject}/>
        <PromptElement />
      </div>
    );
  }
}
