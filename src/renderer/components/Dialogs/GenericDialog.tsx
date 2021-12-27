import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import type { IGenericDialogProps } from 'types/interfaces';

export default class GenericDialog extends React.Component<IGenericDialogProps> {
  title: string;

  constructor(props: IGenericDialogProps) {
    super(props);
    this.title = props.title || 'Title';
  }

  render() {
    return(
      <Dialog open>
        <DialogTitle>
          {this.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {this.props.children}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {this.props.actions}
        </DialogActions>
      </Dialog>
    );
  }
}
