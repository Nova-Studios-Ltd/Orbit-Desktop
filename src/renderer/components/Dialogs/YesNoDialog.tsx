import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { IYesNoDialogProps, IYesNoDialogButtonProps } from 'types/interfaces';

export default class YesNoDialog extends React.Component {
  title: string;
  body: string;
  confirmButtonText: string;
  denyButtonText: string;
  onConfirm: MouseEvent<HTMLButtonElement, MouseEvent>;
  onDeny: MouseEvent<HTMLButtonElement, MouseEvent>;

  constructor(props: IYesNoDialogProps) {
    super(props);
    this.title = props.title || 'Confirm Action';
    this.body = props.body || 'Information about action';
    this.confirmButtonText = props.confirmButtonText || 'OK';
    this.denyButtonText = props.denyButtonText || 'Cancel';
    this.onConfirm = props.onConfirm;
    this.onDeny = props.onDeny;
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
          <Button id='denyButton' onClick={this.props.onDeny}>{this.denyButtonText}</Button>
          <Button id='confirmButton' onClick={this.props.onConfirm}>{this.confirmButtonText}</Button>
        </DialogActions>
      </Dialog>
    );
  }
}
