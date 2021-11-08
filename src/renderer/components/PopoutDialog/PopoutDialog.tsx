import React, { ReactChildren } from 'react';
import { IPopoutDialogProps } from 'dataTypes/interfaces';
import Header from 'renderer/components/Header/Header';
import { IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export default class PopoutDialog extends React.Component {
  caption: string;
  children: ReactChildren;

  constructor(props: IPopoutDialogProps) {
    super(props);
    this.state = { show: props.show || false };
    this.caption = props.caption || '';
    this.children = props.children;
    this.closeButtonClicked = this.closeButtonClicked.bind(this);
  }

  state = {
    show: false
  }

  componentDidUpdate(prevProps: IPopoutDialogProps) {
    console.log(`${this.props.show}, ${prevProps.show}`);
    if (prevProps.show != this.props.show) {
      this.setState({show: this.props.show});
    }
  }

  closeButtonClicked() {
    this.setState({ show: false });
  }

  render() {
    return(
      <div className='PopoutDialog_Container' hidden={!this.state.show}>
        <div className='PopoutDialog_Content_Container'>
          <Header caption={this.caption} misc={<IconButton onClick={this.closeButtonClicked}><CloseIcon /></IconButton>} />
          <div className='PopoutDialog_Content'>
            {this.children}
          </div>
        </div>
        <div className='PopoutDialog_BackDrop' />
      </div>
    );
  }
}
