import React from 'react';
import { Button } from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';
import Header from 'renderer/components/Header/Header';
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
        <Header caption='Friends' onClick={this.props.onNavigationDrawerOpened} icon={<ListIcon />} />
      </div>
    );
  }
}
