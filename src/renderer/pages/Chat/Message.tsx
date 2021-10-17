import { Avatar, Card, CardMedia, Link, Typography, Button } from '@mui/material';
import React, { DOMElement, Ref } from 'react';
import { ipcRenderer } from 'renderer/helpers';
import GLOBALS from 'renderer/Globals';
import { MessageProps, MessageImageProps } from 'renderer/interfaces';

export class MessageImage extends React.Component {
  message: string;
  imageSrc: string;

  constructor(props: MessageImageProps) {
    super(props);
    this.message = props.message;
    this.imageSrc = props.src;
  }

  render() {
    return (
      <div className="Chat_Message_Content" style={({marginBottom: '0.8rem'})}>
        {this.message == this.imageSrc ? null : <><Typography>{this.message}</Typography> <Link target="_blank" href={this.imageSrc}>{this.imageSrc}</Link></>}
          <Card className="Chat_Message_Image">
            <CardMedia
            component="img"
            image={this.imageSrc}
          />
          </Card>
      </div>
    );
  }
}

export default class Message extends React.Component {
  uuid: string;
  author: string;
  message: string;
  avatarSrc: string;
  ref: Ref<any>;
  divRef: Ref<HTMLDivElement>;

  constructor(props: MessageProps) {
    super(props);
    this.uuid = props.uuid;
    this.author = props.author || "Unknown";
    this.message = props.message || "Message";
    this.avatarSrc = props.avatarSrc;
    this.ref = props.ref;

    this.deleteMessage = this.deleteMessage.bind(this);

    this.divRef = React.createRef();
  }

  componentDidMount() {
    if (this.divRef != null)
      this.divRef.current.scrollIntoView({behavior: "smooth", block: "nearest", inline: "start"});
  }

  validURL(str: string) {
    var pattern = new RegExp('^(https:\/\/)+([a-zA-Z]*\.)?([a-zA-Z]*\.)([a-zA-Z]*)');
    return !!pattern.test(str);
  }

  imageURL(url: string) {
    if (this.hasExt(url)) {
      return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }
    else {
      /*var request = new XMLHttpRequest();
      request.open("HEAD", url);
      return (Boolean)(request.onload = () => {
        var contentType = request.getResponseHeader("Content-Type");
        if (contentType?.indexOf("image") != -1) return true;
        return false;
      });*/
      return false;
    }
  }

  hasExt(url: string) {
    var parts = url.split('/');
    var last = parts.at(-1);
    return (parts.length > 3) && (last.indexOf('.') != -1);
  }

  deleteMessage() {
    ipcRenderer.send('requestDeleteMessage', GLOBALS.currentChannel, this.uuid);
  }

  render() {
    /*const urlSearchPattern ="([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?";
    const matches = this.message.match(urlSearchPattern);
    let messageContentObject = null;
    if (matches != null) {
      console.log(matches);
      const filteredMatch = matches[0].split(" ")[0];
      const filteredMessage = this.message.replace(filteredMatch, "");
      console.log(`Match: ${filteredMatch}`);
      messageContentObject = <MessageImage message={filteredMessage} src={filteredMatch} />;
    }
    else {
      messageContentObject = <Typography className="Chat_Message_Content">{this.message}</Typography>;
    }*/

    let messageContentObject = [] as any;
    const message = this.message.split(/( |\n)/g);
    var first = true;
    message.forEach(word => {
      var m = (first)? this.message.replaceAll(word, "") : "";
      if (this.validURL(word) && this.imageURL(word)) messageContentObject.push(<MessageImage key={word} message={word} src={word} />)
      first = false;
    });
    if (messageContentObject.length == 0) messageContentObject.push(<Typography className="Chat_Message_Content">{this.message}</Typography>);

    return (
      <div className="Chat_Message" ref={this.divRef}>
        <div className="Chat_Message_Left">
          <Avatar src={this.avatarSrc} />
        </div>
        <div className="Chat_Message_Right">
          <Typography className="Chat_Message_Name" fontWeight="bold">{this.author}</Typography>
          {messageContentObject}
          <button onClick={this.deleteMessage}>Delete</button>
        </div>
      </div>
    );
  }
}
