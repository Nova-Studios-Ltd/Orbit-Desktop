import React, { ReactChildren } from 'react';
import { Dialog } from '@mui/material';
import { IYesNoDialogProps } from 'types/interfaces';

export default class GenericDialog extends React.Component {
  title: string;
  children: ReactChildren;

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
