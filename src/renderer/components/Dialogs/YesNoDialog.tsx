import React from 'react';
import { Dialog } from '@mui/material';
import { IYesNoDialogProps } from 'types/interfaces';

export default class YesNoDialog extends React.Component {
  title: string;
  body: string;


  constructor(props: IYesNoDialogProps) {
    super(props);
  }

  render() {
    return(
      <Dialog>

      </Dialog>
    );
  }
}
