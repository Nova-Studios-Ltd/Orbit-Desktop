import { Card } from "@mui/material";
import React from "react";
import { Dimensions } from "types/types";
import { IMessageMediaProps } from "../Message";

export class MessageEmbed extends React.Component<IMessageMediaProps> {
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
        <Card className='Message_Embed' style={styles}>
          <iframe className='Message_Embed_Content' src={this.videoSrc} title={"Idiot"} frameBorder="0" allowFullScreen ></iframe>
        </Card>
      </div>
    );
  }
}
