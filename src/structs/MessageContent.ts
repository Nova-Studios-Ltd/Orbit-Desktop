import React from "react";
import type { Dimensions } from "types/types";

interface IMessageContent {
  type: string,
  url: string,
  content?: Uint8Array
  filename?: string,
  filesize?: number,
  dimensions?: Dimensions,
  id?: string
}

export default class MessageContent extends React.Component {
  type: string;
  url: string;
  content?: Uint8Array
  filename?: string;
  filesize?: number;
  dimensions?: Dimensions;
  id?: string;

  constructor(props: IMessageContent) {
    super(props);
    this.type = props.type;
    this.url = props.url;
    this.content = props.content;
    this.filename = props.filename;
    this.filesize = props.filesize;
    this.dimensions = props.dimensions;
    this.id = props.id;
  }
}
