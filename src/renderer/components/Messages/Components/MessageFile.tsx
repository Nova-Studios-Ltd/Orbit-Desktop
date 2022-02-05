import { Icon, Typography, IconButton } from "@mui/material";
import React from "react";
import {Download as DownloadIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';
// eslint-disable-next-line import/no-cycle
import { IMessageMediaProps } from "../Message";

export class MessageFile extends React.Component<IMessageMediaProps> {
  filename?: string;
  filesize?: number;
  url: string;

  constructor(props: IMessageMediaProps) {
    super(props);
    this.filename = props.message;
    this.filesize = props.size;
    this.url = props.src;

    this.download = this.download.bind(this);
  }

  download() {
    window.open(this.url);
  }

  render() {
    return (
      <div className='FileAttachmentContainer'>
        <div className='FileAttachmentContainer_Left'>
          <Icon className='FileAttachmentContainer_Left_Icon'>
            <FileIcon />
          </Icon>
        </div>
        <div className='FileAttachmentContainer_Right'>
          <div className='FileAttachmentContainer_Right_Text_Section'>
            <Typography variant='subtitle1'>{this.filename}</Typography>
            <Typography variant='caption'>{this.filesize} bytes</Typography>
          </div>
          <IconButton className='FileAttachmentContainer_Right_Download_Button' onClick={this.download}><DownloadIcon /></IconButton>
        </div>
      </div>
    );
  }
}
