import { Button } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import GLOBALS from 'shared/globals';

interface IFriendsPageProps {
  onNavigationDrawerOpened: (event: React.MouseEvent<HTMLButtonElement>, open?: boolean) => void
}

interface IFriendsPageState {

}

export default class FriendsPage extends React.Component<IFriendsPageProps> {
  state: IFriendsPageState;

  constructor(props: IFriendsPageProps) {
    super(props);

    this.state = {

    }
  }

  render() {
    return(
      <div>
        <Helmet>
        <title>{`${GLOBALS.appName} ${GLOBALS.appVersion} - No Friends`}</title>
        </Helmet>
        <Button onClick={this.props.onNavigationDrawerOpened}>Open Drawer</Button>
      </div>
    );
  }
}
