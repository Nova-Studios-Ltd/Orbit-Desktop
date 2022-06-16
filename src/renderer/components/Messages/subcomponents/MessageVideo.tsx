import { Typography, Card, CardMedia } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { Debug, ipcRenderer } from "renderer/helpers";

import AppNotification from "renderer/components/Notification/Notification";

import { NotificationAudienceType, NotificationStatusType } from "types/enums";
import { Dimensions } from "types/types";
import type { IMessageMediaProps } from "types/interfaces/components/propTypes/MessageComponentPropTypes";

export default class MessageVideo extends React.Component<IMessageMediaProps> {
  content?: Uint8Array;
  message?: string;
  videoSrc: string;
  dimensions: Dimensions;

  constructor(props: IMessageMediaProps) {
    super(props);
    this.content = props.content;
    this.message = props.message;
    this.videoSrc = props.src;
    this.dimensions = props.dimensions || {width: 600, height: 400};
  }

  download() {
    if (this.content != null) {
      ipcRenderer.invoke("WriteDataToDisk", this.content, this.videoSrc).catch(() => Debug.Log(`Unable to save video "${this.videoSrc}"`, "content was undefined")).then((result: boolean) => {
        if (result) {
          new AppNotification({ title: "Video Saved", notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
        }
        else {
          new AppNotification({ title: "Unable to Save Video", body: "Disk write operation failed", notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
        }
      });
    }
    else {
      new AppNotification({ title: "Unable to Save Video", body: "Video content was undefined (was it a URL?)", notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
    }
  }

  render() {
    const styles = {
      marginBottom: '0.8rem'
    }

    return (
      <div className='Message_Content' style={styles}>
        {this.message == this.videoSrc ? null : <><Typography>{this.message}</Typography> <Link target='_blank' href={this.videoSrc} to={""}>{this.videoSrc}</Link></>}
          <Card className='Message_Embed' style={styles}>
            <CardMedia style={styles}
            className='Message_Embed_Content'
            component='video'
            src={this.videoSrc}
            controls
            />
          </Card>
      </div>
    );
  }
}
