import React from 'react';
import { Chip, Stack } from '@mui/material';
import type MessageAttachment from 'structs/MessageAttachment'

interface IFileUploadSummaryProps {
  files: Array<MessageAttachment>,
  onRemoveAttachment(id: string): void
}

export default class FileUploadSummary extends React.Component<IFileUploadSummaryProps> {
  render() {
    let classNames = 'FileUploadSummary';

    let filesObj: Array<JSX.Element> = [];
    if (this.props != null && this.props.files != null) {
      if (this.props.files.length < 1) {
        classNames = classNames.concat(' ', 'Hidden');
      }

      filesObj = this.props.files.map((v) => (<Chip key={v.id} className='Message_Content' label={v.contents} onDelete={() => this.props.onRemoveAttachment(v.id)} />))
    }

    return (
      <Stack className={classNames} direction='row'>
        {filesObj}
      </Stack>
    );
  }
}
