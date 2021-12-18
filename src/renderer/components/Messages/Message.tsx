import { Avatar, Card, CardMedia, IconButton, Link, Typography, Button, Menu, MenuItem } from '@mui/material';
import { Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';
import React, { DOMElement, FormEvent, Ref } from 'react';
import { MD5 } from 'crypto-js';
import { copyToClipboard, Debug, ipcRenderer } from 'shared/helpers';
import GLOBALS from 'shared/globals';
import type { IMessageProps, IMessageMediaProps, IMessageState, IMessageContent, IAttachmentProps, Dimensions } from 'types/interfaces';
import AppNotification from 'renderer/components/Notification/Notification';
import { LogContext, NotificationAudienceType, NotificationStatusType } from 'types/enums';
import FormTextField from 'renderer/components//Form/FormTextField';
import MessageContent from 'structs/MessageContent';

export class MessageImage extends React.Component {
  message: string;
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
    this.finalDimensions = {
      width: 0,
      height: 0
    };
  }

  render() {
    if (this.dimensions.width > 0 && this.dimensions.height > 0) {
      //this.finalDimensions.height = Math.floor((this.desiredDimensions.width * this.dimensions.height) / this.dimensions.width);
      //this.finalDimensions.width = Math.floor((this.desiredDimensions.height * this.dimensions.width) / this.dimensions.height);

      const xRatio = this.dimensions.width / this.desiredDimensions.width;
      const yRatio = this.dimensions.height / this.desiredDimensions.height;
      const ratio = Math.max(xRatio, yRatio);
      let nnx = Math.floor(this.dimensions.width / ratio);
      let nny = Math.floor(this.dimensions.height / ratio);

      if (this.dimensions.width < this.desiredDimensions.width && this.dimensions.height < this.desiredDimensions.height) {
        nnx = this.dimensions.width;
        nny = this.dimensions.height;
      }

      const styles = {
        width: nnx,
        height: nny,
      }

      return (
        <div className='Message_Content' style={({marginBottom: '0.8rem'})}>
          {this.message == this.imageSrc ? null : <><Typography>{this.message}</Typography> <Link target='_blank' href={this.imageSrc}>{this.imageSrc}</Link></>}
            <Card className='Message_Embed' style={styles}>
              <CardMedia
              className='Message_Embed_Content'
              component='img'
              src={this.imageSrc}
            />
            </Card>
        </div>
      );
    }
    const styles = {
      width: '18rem',
      height: '30rem',
    }
    return (
      <div className='Message_Content' style={({marginBottom: '0.8rem'})}>
        {this.message == this.imageSrc ? null : <><Typography>{this.message}</Typography> <Link target='_blank' href={this.imageSrc}>{this.imageSrc}</Link></>}
          <Card className='Message_Embed' style={styles}>
            <CardMedia
            className='Message_Embed_Content'
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
  dimensions: Dimensions;

  constructor(props: IMessageMediaProps) {
    super(props);
    this.message = props.message;
    this.videoSrc = props.src;
    this.dimensions = props.dimensions || {width: 600, height: 400};
  }

  render() {
    const styles = {
      //width: (this.dimensions.width),
      //height: (this.dimensions.height),
      marginBottom: '0.8rem'
    }

    return (
      <div className='Message_Content' style={styles}>
        {this.message == this.videoSrc ? null : <><Typography>{this.message}</Typography> <Link target='_blank' href={this.videoSrc}>{this.videoSrc}</Link></>}
          <Card className='Message_Embed' style={styles}>
            <CardMedia style={styles}
            className='Message_Embed_Content'
            component='video'
            src={this.videoSrc}
            controls
            />
          </Card>
      </div>
    );
  }
}

export class MessageEmbed extends React.Component {
  message: string;
  videoSrc: string;
  dimensions: Dimensions;

  constructor(props: IMessageMediaProps) {
    super(props);
    this.message = props.message;
    this.videoSrc = props.src;
    this.dimensions = props.dimensions || {width: 600, height: 400};
  }

  spotifyTrackURL(url: string) {
    return new RegExp(/^https:\/\/open\.spotify\.com\/track\/[a-zA-Z?0-9=&/]*/g).test(url);
  }

  render() {
    const styles = {
      //width: (this.dimensions.width),
      //height: (this.dimensions.height),
      marginBottom: '0.8rem'
    }

    return (
      <div className='Message_Content' style={styles}>
        {!this.videoSrc.includes('youtube') ? null : <><Link target='_blank' href={this.videoSrc}>{this.videoSrc}</Link></>}
          <Card className='Message_Embed' style={styles}>
            <iframe className='Message_Embed_Content' src={this.videoSrc} title={"Idiot"} frameBorder="0" allowFullScreen ></iframe>
          </Card>
      </div>
    );
  }
}

export default class Message extends React.Component {
  state: IMessageState;
  message_Id: string;
  author_UUID: string;
  author: string;
  content: string;
  attachments: IAttachmentProps[];
  timestamp: string;
  edited: boolean;
  editedTimestamp: string;
  avatar: string;
  divRef: Ref<HTMLDivElement>;
  hashedKey: string;
  onUpdateCallback: Function;

  constructor(props: IMessageProps) {
    super(props);
    this.message_Id = props.message_Id;
    this.author_UUID = props.author_UUID;
    this.author = props.author || 'Unable to retreive author';
    this.content = props.content;
    this.attachments = props.attachments;
    this.timestamp = props.timestamp.replace("T", " ");
    this.edited = props.edited;
    this.editedTimestamp = props.editedTimestamp.replace("T", " ");
    this.avatar = props.avatar;
    this.onUpdateCallback = props.onUpdate;
    this.hashedKey = `${this.message_Id}_${this.timestamp}_${this.editedTimestamp}}`;

    this.state = {
      editedMessage: '',
      isEditing: false,
      hasNonLinkText: false,
      links: [],
      attachments: [],
      anchorEl: null,
      open: false
    }

    this.openContextMenu = this.openContextMenu.bind(this);
    this.closeContextMenu = this.closeContextMenu.bind(this);
    this.mouseEnter = this.mouseEnter.bind(this);
    this.mouseLeave = this.mouseLeave.bind(this);
    this.menuItemClicked = this.menuItemClicked.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.isOwnMessage = this.isOwnMessage.bind(this);
    this.editMessageChanged = this.editMessageChanged.bind(this);
    this.submitEditedMessage = this.submitEditedMessage.bind(this);
    this.resetMessageEdit = this.resetMessageEdit.bind(this);

    this.divRef = React.createRef();
  }

  openContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    this.setState({ open: !this.state.open, anchorEl: event.currentTarget });
  }

  menuItemClicked(event: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    switch(event.currentTarget.id) {
      case 'edit':
        this.setState({ editedMessage: this.content, isEditing: true });
        break;
      case 'copy':
        copyToClipboard(this.content).then((result: boolean) => {
          if (result) {
            new AppNotification({ body: 'Copied text to clipboard', notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
          }
        });
        break;
      case 'delete':
        this.deleteMessage();
        break;
    }

    this.setState({ open: false, anchorEl: null });
  }

  closeContextMenu(event: any) {
    this.setState({ open: false, anchorEl: null });
  }

  mouseEnter(event: any) {
    if (event != null && event.currentTarget != null && event.currentTarget.className != null) {
      event.currentTarget.className = 'Message Message_Hover';
    }
  }

  mouseLeave(event: any) {
    if (event != null && event.currentTarget != null && event.currentTarget.className != null) {
      event.currentTarget.className = 'Message';
    }
  }

  async componentDidMount() {
    let containsNonLinkText = false;
    const links = this.content.match(/(https:\/\/[\S]*)/g);
    /*if (links == null && this.attachments.length > 0) {
      links = [] as Array<string>;
    }*/
    const attachmentContent = [];
    for (let a = 0; a < this.attachments.length; a++) {
      const attachment = this.attachments[a];
      if (await this.checkImageHeader(attachment.contentUrl)) {
        attachmentContent.push(new MessageContent({type: 'image', url: attachment.contentUrl, dimensions: {width: attachment.contentWidth, height: attachment.contentHeight}}));
      }
      else if(await this.checkVideoHeader(attachment.contentUrl)) {
        attachmentContent.push(new MessageContent({type: 'video', url: attachment.contentUrl, dimensions: {width: attachment.contentWidth, height: attachment.contentHeight}}));
      }
    }

    if (links == null) {
      this.setState({hasNonLinkText: true, attachments: attachmentContent});
      return;
    }

    /*for (let a = 0; a < this.attachments.length; a++) {
      links.push(this.attachments[a].contentUrl);
    }*/

    const messageLinks = [] as Array<MessageContent>;
    for (let l = 0; l < links.length; l++) {
      const link = links[l];
      if (this.imageURL(link) || await this.checkImageHeader(link)) {
        messageLinks.push(new MessageContent({type: 'image', url: link}));
      }
      else if (this.videoURL(link) || await this.checkVideoHeader(link)) {
        messageLinks.push(new MessageContent({type: 'video', url: link}));
      }
      else if (this.youtubeURL(link)) {
        messageLinks.push(new MessageContent({type: 'youtube', url: `https://www.youtube.com/embed/${this.getYoutubeVideoId(link)}`}));
      }
      else if (this.spotifyTrackURL(link)) {
        messageLinks.push(new MessageContent({type: 'spotify', url: `https://open.spotify.com/embed/track/${this.getSpotifyTrackId(link)}`}));
      }
      else if (this.spotifyPlaylistURL(link)) {
        messageLinks.push(new MessageContent({type: 'spotify', url: `https://open.spotify.com/embed/playlist/${this.getSpotifyPlaylistId(link)}`}));
      }
      else {
        containsNonLinkText = true;
      }
    }
    this.setState({links: messageLinks, hasNonLinkText: containsNonLinkText}, () => this.onUpdateCallback());
  }

  async checkImageHeader(url: string) {
    try {
      const res = await fetch(url, {method: 'HEAD'});
      const buff = await res.blob();
      return buff.type.startsWith('image/');
    }
    catch {return false;}
  }

  getYoutubeVideoId(url: string) {
    const m = url.match(/(?<=v=)(.*(?=&)|.*(?=$)*)|(?<=e\/).*(?=$)/g);
    if (m == null) return '';
    return m[0];
  }

  getSpotifyPlaylistId(url: string) {
    const m = url.match(/(?<=t\/)(.*(?=\?)|.*(?=$)*)/g);
    if (m == null) return '';
    return m[0];
  }

  getSpotifyTrackId(url: string) {
    const m = url.match(/(?<=k\/)(.*(?=\?)|.*(?=$)*)/g);
    if (m == null) return '';
    return m[0];
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

  validURL(url: string) {
    const pattern = new RegExp(/^(https:\/\/)+([a-zA-Z]*\.)?([a-zA-Z]*\.)([a-zA-Z]*)/);
    return !!pattern.test(url);
  }

  youtubeURL(url: string) {
    return new RegExp(/^(https:\/\/www\.youtube\.com\/[a-zA-Z?0-9=&]*)|^(https:\/\/youtu\.be\/[a-zA-z?0-9=&]*)/g).test(url);
  }

  spotifyTrackURL(url: string) {
    return new RegExp(/^https:\/\/open\.spotify\.com\/track\/[a-zA-Z?0-9=&/]*/g).test(url);
  }

  spotifyPlaylistURL(url: string) {
    return new RegExp(/^https:\/\/open\.spotify\.com\/playlist\/[a-zA-Z?0-9=&/]*/g).test(url);
  }

  deleteMessage() {
    ipcRenderer.invoke('DELETEMessage', GLOBALS.currentChannel, this.message_Id).then((result: boolean) => {
      if (result) {
        new AppNotification({ body: 'Message deleted successfully', notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
      } else {
        new AppNotification({ body: 'Failed to delete message', notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
      }
    });
  }

  isOwnMessage() {
    return this.author_UUID == GLOBALS.userData.uuid;
  }

  editMessageChanged(event: React.FormEvent<HTMLFormElement>) {
    this.setState({ editedMessage: event.target.value });
  }

  submitEditedMessage() {
    if (this.state.editedMessage.length > 0) {
      ipcRenderer.invoke('EDITMessage', GLOBALS.currentChannel, this.message_Id, this.state.editedMessage).then((result: boolean) => {
        if (result) {
          new AppNotification({ body: 'Message updated', notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
        } else {
          new AppNotification({ body: 'Unable to edit message', notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
        }
      });
    }

    this.resetMessageEdit();
  }

  resetMessageEdit(){
    this.setState({ editedMessage: '', isEditing: false });
  }

  render() {
    const messageContentObject = [] as any;
    const editFormClassNames = this.state.isEditing ? 'Message_Edit' : 'Message_Edit Hidden';

    if (this.state.hasNonLinkText) {
      const mes = this.content.split(/(https:\/\/[\S]*)/g);
      const messageParts = [] as any[];
      mes.forEach(word => {
        if (this.validURL(word)) messageParts.push(<Link key={MD5(word + Date.now().toString()).toString()} target='_blank' href={word}>{word}</Link>);
        else messageParts.push(word);
      });

      messageContentObject.push(<Typography key={"MainMessage"} className='Message_Content'>{messageParts}</Typography>);
    }

    this.state.links.forEach(link => {
      if (link.type == 'image')
        messageContentObject.push(<MessageImage key={MD5(link.url + Date.now().toString()).toString()} message={link.url} src={link.url} />);
      else if (link.type == 'video')
        messageContentObject.push(<MessageVideo key={MD5(link.url + Date.now().toString()).toString()} message={link.url} src={link.url} />);
      else if (link.type == 'youtube')
        messageContentObject.push(<MessageEmbed key={MD5(link.url + Date.now().toString()).toString()} message={link.url} src={link.url} />);
      else if (link.type == 'spotify')
        messageContentObject.push(<MessageEmbed key={MD5(link.url + Date.now().toString()).toString()} message={link.url} src={link.url} />);
    });

    this.state.attachments.forEach(link => {
      if (link.type == 'image')
        messageContentObject.push(<MessageImage key={MD5(link.url + Date.now().toString()).toString()} message={link.url} src={link.url} dimensions={link.dimensions} />);
      else if (link.type == 'video')
        messageContentObject.push(<MessageVideo key={MD5(link.url + Date.now().toString()).toString()} message={link.url} src={link.url} dimensions={link.dimensions} />);
    });

    return (
      <div className='Message' ref={this.divRef} onContextMenu={this.openContextMenu} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        <div className='Message_Left'>
          <Avatar src={this.avatar} />
        </div>
        <div className='Message_Right'>
          <div className='Message_Right_Header'>
            <Typography className='Message_Name' fontWeight='bold'>{this.author}</Typography>
            <Typography className='Message_Timestamp' variant='subtitle2'>{this.timestamp}</Typography>
            {this.edited ? <Typography className='Message_Timestamp_Edited' variant='subtitle2'>(Edited at {this.editedTimestamp})</Typography> : null }
          </div>
          {messageContentObject}
          <form className={editFormClassNames} onSubmit={(event) => { this.submitEditedMessage(); event.preventDefault();}}>
            <FormTextField id={`${this.message_Id}_EditField`} value={this.state.editedMessage} label='Edited Message' onChange={this.editMessageChanged} />
            <IconButton className='Chat_IconButton' onClick={this.resetMessageEdit}><CloseIcon/></IconButton>
            <IconButton className='Chat_IconButton' onClick={this.submitEditedMessage}><SendIcon/></IconButton>
          </form>
        </div>
        <Menu
          id='userdropdown-menu'
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onClose={this.closeContextMenu}
          MenuListProps={{
            'aria-labelledby': 'message-context-menu',
          }}
        >
          { this.isOwnMessage() ? <MenuItem id='edit' onClick={(event) => this.menuItemClicked(event)}>Edit</MenuItem> : null }
          <MenuItem id='copy' onClick={(event) => this.menuItemClicked(event)}>Copy</MenuItem>
          { this.isOwnMessage() ? <MenuItem id='delete' onClick={(event) => this.menuItemClicked(event)}>Delete</MenuItem> : null }
        </Menu>
      </div>
    );
  }
}
