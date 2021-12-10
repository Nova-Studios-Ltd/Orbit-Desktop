import React from "react";
import { IMessageContent } from "types/interfaces";

export default class MessageContent extends React.Component {
  type: string;
  url: string;

  constructor(props: IMessageContent) {
    super(props);
    this.type = props.type;
    this.url = props.url;
  }
}