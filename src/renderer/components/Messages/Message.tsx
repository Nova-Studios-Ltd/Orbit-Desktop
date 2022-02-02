import { Avatar, Card, CardMedia, IconButton, Link, Typography, Menu, MenuItem, Icon } from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon, InsertDriveFile as FileIcon, Send as SendIcon } from '@mui/icons-material';
import React, { Ref } from 'react';
import { MD5 } from 'crypto-js';
import { copyToClipboard, ipcRenderer, Manager } from 'renderer/helpers';
import AppNotification from 'renderer/components/Notification/Notification';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';
import FormTextField from 'renderer/components//Form/FormTextField';
import MessageContent from 'structs/MessageContent';
import { Dimensions } from 'types/types';

export interface IMessageProps {
  message_Id: string,
  author_UUID: string,
  author: string,
  content: string,
  iv: string,
  encryptedKeys: { [key: string] : string; },
  timestamp: string,
  editedTimestamp: string,
  edited: boolean,
  avatar: string,
  attachments: IAttachmentProps[],
  onUpdate: () => void;
  onImageClick?: (src: string, dimensions: Dimensions) => void;
}

interface IMessageState {
  editedMessage: string,
  isEditing: boolean,
  hasNonLinkText: boolean,
  links: MessageContent[],
  attachments: MessageContent[],
  anchorPos: { x: number, y: number},
  open: boolean
}

interface IAttachmentProps {
  contentUrl: string,
  content: Uint8Array,
  filename: string,
  size: number,
  contentWidth: number,
  contentHeight: number
}

interface IMessageMediaProps {
  message?: string,
  src: string,
  size?: number;
  dimensions?: Dimensions,
  onImageClick?: (src: string, dimensions: Dimensions) => void;
}

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
        {this.message == this.imageSrc ? null : <><Typography>{this.message}</Typography> <Link target='_blank' href={this.imageSrc}>{this.imageSrc}</Link></>}
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

export class MessageVideo extends React.Component<IMessageMediaProps> {
  message?: string;
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

export class MessageFile extends React.Component<IMessageMediaProps> {
  filename?: string;
  filesize?: number;
  url: string;

  constructor(props: IMessageMediaProps) {
    super(props);
    this.filename = props.message;
    this.filesize = props.size;
    this.url = props.src;

    this.download = this.download.bind(this);
  }

  download() {
    window.open(this.url);
  }

  render() {
    return (
      <div className='FileAttachmentContainer'>
        <div className='FileAttachmentContainer_Left'>
          <Icon className='FileAttachmentContainer_Left_Icon'>
            <FileIcon />
          </Icon>
        </div>
        <div className='FileAttachmentContainer_Right'>
          <div className='FileAttachmentContainer_Right_Text_Section'>
            <Typography variant='subtitle1'>{this.filename}</Typography>
            <Typography variant='caption'>{this.filesize} bytes</Typography>
          </div>
          <IconButton className='FileAttachmentContainer_Right_Download_Button' onClick={this.download}><DownloadIcon /></IconButton>
        </div>
      </div>
    );
  }
}

export class MessageEmbed extends React.Component<IMessageMediaProps> {
  message?: string;
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
      marginBottom: '0.8rem'
    }
    return (
      <div className='Message_Content' style={styles}>
        <Card className='Message_Embed' style={styles}>
          <iframe className='Message_Embed_Content' src={this.videoSrc} title={"Idiot"} frameBorder="0" allowFullScreen ></iframe>
        </Card>
      </div>
    );
  }
}

export default class Message extends React.Component<IMessageProps> {
  state: IMessageState;
  message_Id: string;
  author_UUID: string;
  author: string;
  content: string;
  iv: string;
  encryptedKeys: { [key: string] : string; };
  attachments: IAttachmentProps[];
  timestamp: string;
  edited: boolean;
  editedTimestamp: string;
  avatar: string;
  divRef: Ref<HTMLDivElement>;
  hashedKey: string;
  onUpdateCallback: () => void;

  constructor(props: IMessageProps) {
    super(props);
    this.message_Id = props.message_Id;
    this.author_UUID = props.author_UUID;
    this.author = props.author || 'Unable to retreive author';
    this.content = props.content;
    this.attachments = props.attachments;
    this.timestamp = props.timestamp.replace("T", " ");
    this.edited = props.edited;
    this.editedTimestamp = props.editedTimestamp.replace("T", " @ ");
    this.avatar = props.avatar;
    this.onUpdateCallback = props.onUpdate;
    this.hashedKey = `${this.message_Id}_${this.timestamp}_${this.editedTimestamp}}`;
    this.encryptedKeys = props.encryptedKeys;
    this.iv = props.iv;

    this.state = {
      editedMessage: '',
      isEditing: false,
      hasNonLinkText: false,
      links: [],
      attachments: [],
      anchorPos: { x: 0, y: 0},
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
    this.onImageClick = this.onImageClick.bind(this);

    this.divRef = React.createRef();
  }

  openContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    this.setState({ open: true, anchorPos: { x: event.clientX, y: event.clientY } });
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

    this.setState({ open: false, anchorPos: { x: 0, y: 0} });
  }

  closeContextMenu() {
    this.setState({ open: false, anchorPos: { x: 0, y: 0} });
  }

  mouseEnter(event: React.MouseEvent<HTMLDivElement>) {
    if (event != null && event.currentTarget != null && event.currentTarget.className != null) {
      event.currentTarget.className = 'Message_Right Message_Hover';
    }
  }

  mouseLeave(event: React.MouseEvent<HTMLDivElement>) {
    if (event != null && event.currentTarget != null && event.currentTarget.className != null) {
      event.currentTarget.className = 'Message_Right';
    }
  }

  async componentDidMount() {
    let containsNonLinkText = false;
    //const links = this.content.match(/(https:\/\/[\S]*)/g);
    const links = this.content.split(' ');
    const attachmentContent = [];
    for (let a = 0; a < this.attachments.length; a++) {
      const attachment = this.attachments[a];
      if (await this.checkImageHeader(attachment.contentUrl)) {
        attachmentContent.push(new MessageContent({type: 'image', id: attachment.contentUrl, url: URL.createObjectURL(new Blob([attachment.content], {type: 'image/jpeg'})), filename: attachment.filename, filesize: attachment.size, dimensions: {width: attachment.contentWidth, height: attachment.contentHeight}}));
      }
      else if(await this.checkVideoHeader(attachment.contentUrl)) {
        attachmentContent.push(new MessageContent({type: 'video', id: attachment.contentUrl, url: URL.createObjectURL(new Blob([attachment.content], {type: 'video/mp4'})), filename: attachment.filename, filesize: attachment.size, dimensions: {width: attachment.contentWidth, height: attachment.contentHeight}}));
      }
      else {
        attachmentContent.push(new MessageContent({type: 'file', id: attachment.contentUrl, url: attachment.contentUrl, filename: attachment.filename, filesize: attachment.size }));
      }
    }

    if (this.content.match(/(https:\/\/[\S]*)/g) == null) {
      this.setState({hasNonLinkText: true, attachments: attachmentContent});
    }

    const messageLinks = [] as Array<MessageContent>;
    for (let l = 0; l < links.length; l++) {
      const link = links[l];
      if (!this.validURL(link)) {
        containsNonLinkText = true;
      }
      else if (this.imageURL(link) || await this.checkImageHeader(link)) {
        const dims = await this.getImageSize(link);
        messageLinks.push(new MessageContent({type: 'image', url: link, dimensions: {width: dims.width, height: dims.height}}));
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

  getImageSize(url: string) {
    return new Promise<Dimensions>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({width: img.width, height: img.height});
      img.onerror = () => reject();
      img.src = url;
    });
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
    return new RegExp(/^(https:\/\/)+([a-zA-Z]*\.)?([a-zA-Z]*\.)([a-zA-Z]*)/).test(url);
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
    ipcRenderer.invoke('DELETEMessage', Manager.ReadConst<string>("CurrentChannel"), this.message_Id).then((result: boolean) => {
      if (result) {
        new AppNotification({ body: 'Message deleted successfully', notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
      } else {
        new AppNotification({ body: 'Failed to delete message', notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
      }
    });
  }

  isOwnMessage() {
    return this.author_UUID == Manager.UserData.uuid;
  }

  editMessageChanged(event: React.FormEvent<HTMLInputElement>) {
    // TODO If editing breaks check here
    this.setState({ editedMessage: event.currentTarget.value });
  }

  submitEditedMessage() {
    if (this.state.editedMessage.length > 0) {
      ipcRenderer.invoke('EDITMessage', Manager.ReadConst<string>("CurrentChannel"), this.message_Id, this.state.editedMessage, this.props.encryptedKeys, this.props.iv).then((result: boolean) => {
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

  onImageClick(src: string, dimensions: Dimensions) {
    if (this.props != null && this.props.onImageClick != null) this.props.onImageClick(src, dimensions);
  }

  render() {
    const messageContentObject = [] as JSX.Element[];
    const editFormClassNames = this.state.isEditing ? 'Message_Edit' : 'Message_Edit Hidden';

    if (this.state.hasNonLinkText) {
      const mes = this.content.split(/(https:\/\/[\S]*)/g);
      const messageParts = [] as JSX.Element[];
      mes.forEach(word => {
        if (this.validURL(word)) messageParts.push(<Link key={MD5(word + Date.now().toString()).toString()} target='_blank' href={word}>{word}</Link>);
        else messageParts.push((word) as unknown as JSX.Element);
      });

      messageContentObject.push(<Typography key={"MainMessage"} className='Message_Content'>{messageParts}</Typography>);
    }

    this.state.links.forEach(link => {
      if (link.type == 'image')
        messageContentObject.push(<MessageImage key={MD5(link.url)} message={link.url} src={link.url} dimensions={link.dimensions} onImageClick={this.onImageClick} />);
      else if (link.type == 'video')
        messageContentObject.push(<MessageVideo key={MD5(link.url)} message={link.url} src={link.url} />);
      else if (link.type == 'youtube')
        messageContentObject.push(<MessageEmbed key={MD5(link.url)} message={link.url} src={link.url} />);
      else if (link.type == 'spotify')
        messageContentObject.push(<MessageEmbed key={MD5(link.url)} message={link.url} src={link.url} />);
    });

    this.state.attachments.forEach(link => {
      if (link.type == 'image')
        messageContentObject.push(<MessageImage key={MD5(link.id)} message={link.url} src={link.url} dimensions={link.dimensions} onImageClick={this.onImageClick} />);
      else if (link.type == 'video')
        messageContentObject.push(<MessageVideo key={MD5(link.id)} message={link.url} src={link.url} dimensions={link.dimensions} />);
      else if (link.type == 'file')
        messageContentObject.push(<MessageFile key={MD5(link.id)} message={link.filename} size={link.filesize} src={link.url} />);
    });

    return (
      <div className='Message' ref={this.divRef} onContextMenu={this.openContextMenu}>
        <div className='Message_Left'>
          <Avatar src={`${this.avatar}&${Date.now()}`} />
        </div>
        <div className='Message_Right' onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
          <div className='Message_Right_Header'>
            <Typography className='Message_Name' fontWeight='bold'>{this.author}</Typography>
            <Typography className='Message_Timestamp' variant='subtitle2'>{this.timestamp}</Typography>
            {this.edited ? <Typography className='Message_Timestamp_Edited' variant='subtitle2'>(Edited on {this.editedTimestamp})</Typography> : null }
          </div>
          {messageContentObject}
          <form className={editFormClassNames} onSubmit={(event) => { this.submitEditedMessage(); event.preventDefault();}}>
            <FormTextField id={`${this.message_Id}_EditField`} value={this.state.editedMessage} label='Edited Message' onChange={this.editMessageChanged} />
            <IconButton className='Chat_IconButton' onClick={this.resetMessageEdit}><CloseIcon/></IconButton>
            <IconButton className='Chat_IconButton' onClick={this.submitEditedMessage}><SendIcon/></IconButton>
          </form>
        </div>
        <Menu
          id='message-context-menu'
          anchorReference='anchorPosition'
          anchorPosition={{ top: this.state.anchorPos.y, left: this.state.anchorPos.x }}
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
