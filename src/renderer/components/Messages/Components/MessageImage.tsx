import { Typography, Card, CardMedia } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { Dimensions } from "types/types";
import { IMessageMediaProps } from "../Message";

export class MessageImage extends React.Component<IMessageMediaProps> {
  message?: string;
  imageSrc: string;
  dimensions: Dimensions;
  desiredDimensions: Dimensions;
  finalDimensions: Dimensions;

  constructor(props: IMessageMediaProps) {
    super(props);
    this.message = props.message;
    this.imageSrc = props.src;
    this.dimensions = props.dimensions || {width: 0, height: 0};
    this.desiredDimensions = {
      width: 575,
      height: 400
    };

    if (this.dimensions.width > 0 && this.dimensions.height > 0) {
      const xRatio = this.dimensions.width / this.desiredDimensions.width;
      const yRatio = this.dimensions.height / this.desiredDimensions.height;
      const ratio = Math.max(xRatio, yRatio);
      let nnx = Math.floor(this.dimensions.width / ratio);
      let nny = Math.floor(this.dimensions.height / ratio);

      if (this.dimensions.width < this.desiredDimensions.width && this.dimensions.height < this.desiredDimensions.height) {
        nnx = this.dimensions.width;
        nny = this.dimensions.height;
      }

      this.finalDimensions = {width: nnx, height: nny}
    }
    else {
      this.finalDimensions = {
        width: 0,
        height: 0
      };
    }

    this.onImageClick = this.onImageClick.bind(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onImageClick(_event: never) {
    if (this.props != null && this.props.onImageClick != null) this.props.onImageClick(this.imageSrc, this.dimensions);
  }

  render() {
    const styles = {
      width: this.finalDimensions.width > 0 ? this.finalDimensions.width: '18rem',
      height: this.finalDimensions.height > 0 ? this.finalDimensions.height: '30rem',
    }

    return (
      <div className='Message_Content'>
        {this.message == this.imageSrc ? null : <><Typography>{this.message}</Typography> <Link target='_blank' href={this.imageSrc} to={""}>{this.imageSrc}</Link></>}
          <Card className='Message_Embed' style={styles}>
            <CardMedia
            onClick={this.onImageClick}
            onKeyDown={this.onImageClick}
            className='Message_Embed_Content'
            component='img'
            src={this.imageSrc}
          />
          </Card>
      </div>
    );
  }
}
