import React from 'react';
import { Dialog } from '@mui/material';
import type { IFileUploadDialog } from 'types/interfaces';

export default class FileUploadDialog extends React.Component<IFileUploadDialog> {

  render() {
    return(
      <Dialog open={false}>

      </Dialog>
    );
  }
}
