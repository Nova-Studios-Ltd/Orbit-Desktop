import React from 'react';
import { Chip, Typography } from '@mui/material';
import { IFileUploadSummaryProps, IFileUploadSummaryState } from 'types/interfaces';

export default class FileUploadSummary extends React.Component {
  state: IFileUploadSummaryState;

  constructor(props: IFileUploadSummaryProps) {
    super(props);

    this.state = {
      files: []
    }
  }

  render() {
    return (
      <div className='FileUploadSummary'>

      </div>
    );
  }
}
