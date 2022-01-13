import { Button } from '@mui/material';
import React from 'react';

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
        <Button onClick={this.props.onNavigationDrawerOpened}>Open Drawer</Button>
      </div>
    );
  }
}
