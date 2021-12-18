import React from 'react';
import { Chip, Typography } from '@mui/material';
import { IFileUploadSummaryProps, IFileUploadSummaryState } from 'types/interfaces';
import MessageAttachment from 'structs/MessageAttachment';

export default class FileUploadSummary extends React.Component {
  state: IFileUploadSummaryState;

  constructor(props: IFileUploadSummaryProps) {
    super(props);

    this.state = {
      files: [new MessageAttachment('Test 1', false), new MessageAttachment('Test 2', false), new MessageAttachment('Test 3', false)]
    }
  }

  render() {
    const filesObj = this.state.files.map((v, i, a) => (<Typography key={v.contents} className='Message_Content'>{v.contents}</Typography>))
    return (
      <div className='FileUploadSummary'>
        {filesObj}
      </div>
    );
  }
}
