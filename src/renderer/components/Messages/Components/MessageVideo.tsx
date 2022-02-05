import { Typography, Card, CardMedia } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { Dimensions } from "types/types";
import { IMessageMediaProps } from "../Message";

export class MessageVideo extends React.Component<IMessageMediaProps> {
  message?: string;
  videoSrc: string;
  dimensions: Dimensions;

  constructor(props: IMessageMediaProps) {
    super(props);
    this.message = props.message;
    this.videoSrc = props.src;
    this.dimensions = props.dimensions || {width: 600, height: 400};
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
