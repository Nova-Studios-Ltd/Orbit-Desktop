import React from "react";
import { Dimensions, IMessageContent } from "types/interfaces";

export default class MessageContent extends React.Component {
  type: string;
  url: string;
  dimensions?: Dimensions;

  constructor(props: IMessageContent) {
    super(props);
    this.type = props.type;
    this.url = props.url;
    this.dimensions = props.dimensions;
  }
}
