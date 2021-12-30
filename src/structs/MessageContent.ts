import React from "react";
import type { Dimensions } from "types/types";

interface IMessageContent {
  type: string,
  url: string,
  filename?: string,
  filesize?: number,
  dimensions?: Dimensions
}

export default class MessageContent extends React.Component {
  type: string;
  url: string;
  filename?: string;
  filesize?: number;
  dimensions?: Dimensions;

  constructor(props: IMessageContent) {
    super(props);
    this.type = props.type;
    this.url = props.url;
    this.filename = props.filename;
    this.filesize = props.filesize;
    this.dimensions = props.dimensions;
  }
}
