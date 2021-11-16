import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { IYesNoDialogProps, IYesNoDialogButtonProps } from 'types/interfaces';

export default class YesNoDialog extends React.Component {
  title: string;
  body: string;
  YesButtonProps: IYesNoDialogButtonProps;
  NoButtonProps: IYesNoDialogButtonProps;

  constructor(props: IYesNoDialogProps) {
    super(props);
    this.title = props.title || 'Confirm Action';
    this.body = props.body || 'Information about action';
    this.YesButtonProps = props.YesButtonProps || {body: 'OK', clicked: () => {console.log('Yes button clicked');}};
    this.NoButtonProps = props.NoButtonProps || {body: 'Cancel', clicked: () => {console.log('No button clicked');}};
  }

  render() {
    return(
      <Dialog open={this.props.show}>
        <DialogTitle>
          {this.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {this.body}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button id='noButton' onClick={this.NoButtonProps.clicked}>{this.NoButtonProps.body}</Button>
          <Button id='yesButton' onClick={this.YesButtonProps.clicked}>{this.YesButtonProps.body}</Button>
        </DialogActions>
      </Dialog>
    );
  }
}
