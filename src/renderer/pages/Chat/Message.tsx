import { Avatar, Card, CardMedia, Link, Typography } from '@mui/material';
import React, { DOMElement, Ref } from 'react';

export class MessageImage extends React.Component {
  message: string;
  imageSrc: string;

  constructor(props: any) {
    super(props);
    this.message = props.message;
    this.imageSrc = props.src;
  }

  render() {
    return (
      <Typography className="Chat_Message_Content" >
        {this.message == this.imageSrc ? null : <>{this.message} <Link href={this.imageSrc}>{this.imageSrc}</Link></>}
          <Card className="Chat_Message_Image">
            <CardMedia
            component="img"
            image={this.imageSrc}
          />
          </Card>
      </Typography>
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

  validURL(str: string) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
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
    message.forEach(word => {
      if (this.validURL(word)) messageContentObject.push(<MessageImage message={word} src={word} />)
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
        </div>
      </div>
    );
  }
}
