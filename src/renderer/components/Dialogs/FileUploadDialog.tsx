import React from 'react';
import { Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import type { IFileUploadDialog } from 'types/interfaces';

export default class FileUploadDialog extends React.Component {

  constructor(props: IFileUploadDialog) {
    super(props);
  }

  render() {
    return(
      <Dialog>

      </Dialog>
    );
  }
}
