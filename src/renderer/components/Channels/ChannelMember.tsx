import { Avatar, ButtonBase, Typography } from "@mui/material";
import React from "react";

import type { IChannelMemberProps } from "types/interfaces/components/propTypes/ChannelComponentPropTypes";

export default class ChannelMember extends React.Component<IChannelMemberProps> {
  render() {
    return (
      <div className="ChannelMember">
        <ButtonBase className="ChannelMemberInnerButtonBase">
          <div className="ChannelMemberInner">
            <div className="ChannelMemberLeft">
              <Avatar className="ChannelMemberIcon" src={this.props.avatar} />
            </div>
            <div className="ChannelMemberRight">
              <Typography className="ChannelMemberCaption" variant="h6">
                {this.props.username}
              </Typography>
            </div>
          </div>
        </ButtonBase>
      </div>
    );
  }
}
