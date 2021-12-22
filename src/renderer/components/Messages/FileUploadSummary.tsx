import React from 'react';
import { Chip, Stack } from '@mui/material';
import { IFileUploadSummaryProps } from 'types/interfaces';
import MessageAttachment from 'structs/MessageAttachment';

export default class FileUploadSummary extends React.Component {
  props: IFileUploadSummaryProps;

  render() {
    let classNames = 'FileUploadSummary';

    let filesObj: Array<MessageAttachment> = [];
    if (this.props != null && this.props.files != null) {
      if (this.props.files.length < 1) {
        classNames = classNames.concat(' ', 'Hidden');
      }

      filesObj = this.props.files.map((v, i, a) => (<Chip key={v.id} className='Message_Content' label={v.contents} onDelete={() => this.props.onRemoveAttachment(v.id)} />))
    }

    return (
      <Stack className={classNames} direction='row'>
        {filesObj}
      </Stack>
    );
  }
}
