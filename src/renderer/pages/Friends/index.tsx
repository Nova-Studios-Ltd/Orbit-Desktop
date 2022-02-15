import React from "react";
import { Button, Typography } from "@mui/material";
import { List as ListIcon } from "@mui/icons-material";
import Header from "renderer/components/Header/Header";
import { Helmet } from "react-helmet";
import { Manager } from "renderer/helpers";

import Friend from "renderer/components/Friends/Friend";

interface IFriendsPageProps {
  onNavigationDrawerOpened: (event: React.MouseEvent<HTMLButtonElement>, open?: boolean) => void
}

interface IFriendsPageState {

}

export default class FriendsPage extends React.Component<IFriendsPageProps, IFriendsPageState> {

  constructor(props: IFriendsPageProps) {
    super(props);

    this.state = {

    }
  }

  render() {
    return(
      <div className="Page Friends_Page_Container">
        <Helmet>
        <title>{`${Manager.AppName} ${Manager.AppVersion} - Friendless`}</title>
        </Helmet>
        <Header caption="Friends" onClick={this.props.onNavigationDrawerOpened} icon={<ListIcon />} />
        <div className="Friends_Page_InnerContainer">
          <div className="FriendsListContainer">
            <div className="FriendsList">
              <Friend />
              <Friend />
              <Friend />
              <Friend />
              <Friend />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
