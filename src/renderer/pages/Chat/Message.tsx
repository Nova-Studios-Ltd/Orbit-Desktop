import { Avatar, Typography } from '@mui/material';
import React, { DOMElement, Ref } from 'react';

// <Message content="Message" author="User" uuid={internalShit} avatarSrc="URL to user's avatar" />

export class MessageImage extends React.Component {
  imageSrc: string;
  constructor(props: any) {
    super(props);
    this.imageSrc = props.src;
  }

  render() {
    return (<img src={this.imageSrc}/>);
  }
}

export default class Message extends React.Component {
  uuid: string;
  author: string;
  message: string;
  avatarSrc: string;
  ref: Ref<any>;
  divRef: Ref<HTMLDivElement>;

  constructor(props: any) {
    super(props);
    this.uuid = props.uuid;
    this.author = props.author || "Unknown";
    this.message = props.message || "Message";
    this.avatarSrc = props.avatarSrc;
    this.ref = props.ref;

    this.divRef = React.createRef();
  }

  componentDidMount() {
    if (this.divRef != null)
      this.divRef.current.scrollIntoView({behavior: "smooth", block: "nearest", inline: "start"});
  }
  static regex = "([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?";
  render() {
    if(new RegExp(Message.regex).test(this.message)) {
      var links = this.message.match(Message.regex);
      if (links !== null) {
        const imagesToRender = links.map((m, key) => (<MessageImage key={key} src={m}/>));
        return (
          <div className="Chat_Message" ref={this.divRef}>
            <div className="Chat_Message_Left">
              <Avatar src={this.avatarSrc} />
            </div>
            <div className="Chat_Message_Right">
              <Typography className="Chat_Message_Name" fontWeight="bold">{this.author}</Typography>
              <Typography className="Chat_Message_Content">{this.message}<br/>{imagesToRender}</Typography>
            </div>
          </div>
        );
      }
    }
    return (
      <div className="Chat_Message" ref={this.divRef}>
        <div className="Chat_Message_Left">
          <Avatar src={this.avatarSrc} />
        </div>
        <div className="Chat_Message_Right">
          <Typography className="Chat_Message_Name" fontWeight="bold">{this.author}</Typography>
          <Typography className="Chat_Message_Content">{this.message}</Typography>
        </div>
      </div>
    );
  }
}
