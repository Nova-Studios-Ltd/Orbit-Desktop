import React from "react";
import { Button, Typography } from "@mui/material";
import { List as ListIcon } from "@mui/icons-material";
import Header from "renderer/components/Header/Header";
import { Helmet } from "react-helmet";
import { Manager } from "renderer/helpers";

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
      <div className="Page">
        <Helmet>
        <title>{`${Manager.AppName} ${Manager.AppVersion} - No Friends`}</title>
        </Helmet>
        <div className="Friends_Page_Body">
          <Header caption="Friends" onClick={this.props.onNavigationDrawerOpened} icon={<ListIcon />} />
          <Typography variant="h4">How Lonely</Typography>
        </div>
      </div>
    );
  }
}
