import { Typography } from "@mui/material";
import React from "react";
import { Debug, ipcRenderer } from "renderer/helpers";
import { UserIDNameTuple } from "types/types";
import Channel from "./Channel";
import ChannelMember from "./ChannelMember";

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
      return <ChannelMember userID={member.userID} username={member.username} avatar={member.avatar} />
    });

    return (
      <div className="ChannelMemberListContainer">
        <Typography sx={{ color: "text.primary", alignSelf: "center" }} variant="h5">Channel Members</Typography>
        <div className="ChannelMemberList">
          {members}
        </div>
      </div>
    );
  }
}
