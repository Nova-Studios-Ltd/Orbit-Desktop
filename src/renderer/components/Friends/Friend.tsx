import { Avatar, Typography } from "@mui/material";
import React from "react";

import type { IFriendProps } from "types/interfaces/components/propTypes/FriendComponentPropTypes";
import type { IFriendState } from "types/interfaces/components/states/FriendComponentStates";

export default class Friend extends React.Component<IFriendProps, IFriendState> {

  constructor(props: IFriendProps) {
    super(props);

    this.state = {

    }
  }

  render() {
    return(
      <div className="Friend">
        <div className="FriendLeft">
          <Avatar />
        </div>
        <div className="FriendRight">
          <Typography className="FriendName AdaptiveText">Imaginary Friend</Typography>
        </div>
      </div>
    );
  }
}
