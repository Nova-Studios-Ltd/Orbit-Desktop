import { Typography } from "@mui/material";
import { People as PeopleIcon } from "@mui/icons-material";
import React from "react";
import { Debug, ipcRenderer } from "renderer/helpers";
import { UserIDNameTuple } from "types/types";
import Header from "renderer/components/Header/Header";
import Channel from "./Channel";
import ChannelMember from "./ChannelMember";

import { Alignment, ChannelType } from "types/enums";

export interface IChannelMemberListProps {
  channel: Channel | undefined;
}

export interface IChannelMemberListState {

}

export default class ChannelMemberList extends React.Component<IChannelMemberListProps, IChannelMemberListState> {
  users: UserIDNameTuple[] = [];

  componentDidUpdate(prevProps: IChannelMemberListProps) {
    if (this.props.channel != null && this.props.channel !== prevProps.channel) {
      if (this.props.channel != null && this.props.channel.channelMembers != null) {
        ipcRenderer.invoke("GETUserDataFromID", this.props.channel.channelMembers).then((mappedArray: UserIDNameTuple[]) => {
          this.users = mappedArray;
        });
      }
      else {
        Debug.Warn("Unable to populate ChannelMemberList", "'Channel' object was undefined");
      }
    }
  }

  render() {

    const members = this.users.map((member) => {
      return <ChannelMember key={`${Date.now}_${member.userID}`} userID={member.userID} username={member.username} avatar={member.avatar} />
    });

    if (this.props.channel != null && this.props.channel.channelType === ChannelType.Group) {
      return (
        <div className="ChannelMemberListContainer">
          <Header caption="Channel Members" icon={<PeopleIcon />} />
          <div className="ChannelMemberList">
            {members}
          </div>
        </div>
      );
    }
    return null;
  }
}
