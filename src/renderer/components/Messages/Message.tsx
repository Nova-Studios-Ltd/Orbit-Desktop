import { Avatar, Card, CardMedia, Link, Typography, Button } from '@mui/material';
import React, { DOMElement, Ref } from 'react';
import { ipcRenderer } from 'renderer/helpers';
import GLOBALS from 'renderer/globals';
import { IMessageProps, IMessageImageProps, IMessageContent } from 'renderer/interfaces';

export class MessageImage extends React.Component {
  message: string;
  imageSrc: string;

  constructor(props: IMessageImageProps) {
    super(props);
    this.message = props.message;
    this.imageSrc = props.src;
  }

  render() {
    return (
      <div className='Chat_Message_Content' style={({marginBottom: '0.8rem'})}>
        {this.message == this.imageSrc ? null : <><Typography>{this.message}</Typography> <Link target='_blank' href={this.imageSrc}>{this.imageSrc}</Link></>}
          <Card className='Chat_Message_Image'>
            <CardMedia
            component='img'
            src={this.imageSrc}
          />
          </Card>
      </div>
    );
  }
}

export class MessageVideo extends React.Component {
  message: string;
  videoSrc: string;

  constructor(props: IMessageImageProps) {
    super(props);
    this.message = props.message;
    this.videoSrc = props.src;
  }

  render() {
    return (
      <div className='Chat_Message_Content' style={({marginBottom: '0.8rem'})}>
        {this.message == this.videoSrc ? null : <><Typography>{this.message}</Typography> <Link target='_blank' href={this.videoSrc}>{this.videoSrc}</Link></>}
          <Card className='Chat_Message_Image'>
            <CardMedia
            component='video'
            src={this.videoSrc}
            controls
            />

          </Card>
      </div>
    );
  }
}

class MessageContent extends React.Component {
  type: string;
  url: string;

  constructor(props: IMessageContent) {
    super(props);
    this.type = props.type;
    this.url = props.url;
  }
}

export default class Message extends React.Component {
  uuid: string;
  author: string;
  message: string;
  avatarSrc: string;
  ref: Ref<any>;
  divRef: Ref<HTMLDivElement>;

  constructor(props: IMessageProps) {
    super(props);
    this.uuid = props.uuid;
    this.author = props.author || 'Unknown';
    this.message = props.message || 'Message';
    this.avatarSrc = props.avatarSrc;
    this.ref = props.ref;

    this.deleteMessage = this.deleteMessage.bind(this);

    this.divRef = React.createRef();
  }

  state = {
    links: [] as Array<MessageContent>
  }

  async componentDidMount() {
    if (this.divRef != null)
      this.divRef.current.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});

    let links = this.message.match(/(https:\/\/[\S]*)/g);
    if (links == null) return;
    let messageLinks = [] as Array<MessageContent>;
    for (let l = 0; l < links.length; l++) {
      const link = links[l];
      if (this.imageURL(link) || await this.checkImageHeader(link)) {
        messageLinks.push(new MessageContent({type: 'image', url: link}));
      }
      else if (this.videoURL(link) || await this.checkVideoHeader(link)) {
        messageLinks.push(new MessageContent({type: 'video', url: link}));
      }
    }
    this.setState({links: messageLinks});
  }

  validURL(str: string) {
    var pattern = new RegExp('^(https:\/\/)+([a-zA-Z]*\.)?([a-zA-Z]*\.)([a-zA-Z]*)');
    return !!pattern.test(str);
  }

  async checkImageHeader(url: string) {
    try {
      const res = await fetch(url, {method: 'HEAD'});
      const buff = await res.blob();
      return buff.type.startsWith('image/');
    }
    catch {return false;}
  }

  async checkVideoHeader(url: string) {
    try {
      const res = await fetch(url, {method: 'HEAD'});
      const buff = await res.blob();
      return buff.type.startsWith('video/');
    }
    catch {return false;}
  }

  imageURL(url: string) {
    return (url.match(/\.(jpeg|jpg|png|gif|webp)$/) != null);
  }

  videoURL(url: string) {
    return(url.match(/\.(mp4|webm)$/) != null);
  }

  deleteMessage() {
    ipcRenderer.send('requestDeleteMessage', GLOBALS.currentChannel, this.uuid);
  }

  render() {
    let messageContentObject = [] as any;
    let content = this.message.split(/(https:\/\/[\S]*)/g);
    let links = this.message.match(/(https:\/\/[\S]*)/g);
    let containsText = false;
    console.log(links);
    content.forEach(word => {
      if (!this.validURL(word) && word != '') containsText = true;
    });

    if (containsText) {
      const mes = this.message.split(/(https:\/\/[\S]*)/g);
      var messageParts = [] as any[];
      console.log(mes);
      mes.forEach(word => {
        if (this.validURL(word)) messageParts.push(<Link target='_blank' href={word}>{word}</Link>);
        else messageParts.push(word);
      });

      messageContentObject.push(<Typography className='Chat_Message_Content'>{messageParts}</Typography>);
    }

    /*if (links != null && links.length > 0) {
      links.forEach(link => {
        if (this.imageURL(link)) messageContentObject.push(<MessageImage key={link} message={link} src={link} />);
        else if (this.videoURL(link)) messageContentObject.push(<MessageVideo key={link} message={link} src={link} />);
      });
    }*/
    console.log(this.state.links);
    this.state.links.forEach(link => {
      if (link.type == 'image')
        messageContentObject.push(<MessageImage key={link.url} message={link.url} src={link.url} />);
      else if (link.type == 'video')
        messageContentObject.push(<MessageVideo key={link.url} message={link.url} src={link.url} />);
    });

    return (
      <div className='Chat_Message' ref={this.divRef}>
        <div className='Chat_Message_Left'>
          <Avatar src={this.avatarSrc} />
        </div>
        <div className='Chat_Message_Right'>
          <Typography className='Chat_Message_Name' fontWeight='bold'>{this.author}</Typography>
          {messageContentObject}
          <button onClick={this.deleteMessage}>Delete</button>
        </div>
      </div>
    );
  }
}
