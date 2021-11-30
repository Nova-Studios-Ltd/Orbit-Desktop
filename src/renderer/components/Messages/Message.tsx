import { Avatar, Card, CardMedia, IconButton, Link, Typography, Button, Menu, MenuItem } from '@mui/material';
import { Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';
import React, { DOMElement, FormEvent, Ref } from 'react';
import { copyToClipboard, ipcRenderer } from 'shared/helpers';
import GLOBALS from 'shared/globals';
import type { IMessageProps, IMessageImageProps, IMessageState, IMessageContent } from 'types/interfaces';
import AppNotification from 'renderer/components/Notification/Notification';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';
import FormTextField from '../Form/FormTextField';

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
      <div className='Message_Content' style={({marginBottom: '0.8rem'})}>
        {this.message == this.imageSrc ? null : <><Typography>{this.message}</Typography> <Link target='_blank' href={this.imageSrc}>{this.imageSrc}</Link></>}
          <Card className='Message_Image'>
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
      <div className='Message_Content' style={({marginBottom: '0.8rem'})}>
        {this.message == this.videoSrc ? null : <><Typography>{this.message}</Typography> <Link target='_blank' href={this.videoSrc}>{this.videoSrc}</Link></>}
          <Card className='Message_Image'>
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
  state: IMessageState;
  message_Id: string;
  author_UUID: string;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
  divRef: Ref<HTMLDivElement>;

  constructor(props: IMessageProps) {
    super(props);
    this.message_Id = props.message_Id;
    this.author_UUID = props.author_UUID;
    this.author = props.author || 'Unknown';
    this.content = props.content || 'Message';
    this.timestamp = props.timestamp.replace("T", " ");
    this.avatar = props.avatar;

    this.state = {
      editedMessage: '',
      isEditing: false,
      hasNonLinkText: false,
      links: [],
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

  async menuItemClicked(event: React.ReactElement<any, string | React.JSXElementConstructor<any>>) {
    switch(event.currentTarget.id) {
      case 'edit':
        this.setState({ editedMessage: this.content, isEditing: true });
        break;
      case 'copy':
        await copyToClipboard(this.content).then((result: Boolean) => {
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
    let hasNonLinkText = false;
    let links = this.content.match(/(https:\/\/[\S]*)/g);
    if (links == null) {
      this.setState({hasNonLinkText: true});
      return;
    }
    let messageLinks = [] as Array<MessageContent>;
    for (let l = 0; l < links.length; l++) {
      const link = links[l];
      if (this.imageURL(link) || await this.checkImageHeader(link)) {
        messageLinks.push(new MessageContent({type: 'image', url: link}));
      }
      else if (this.videoURL(link) || await this.checkVideoHeader(link)) {
        messageLinks.push(new MessageContent({type: 'video', url: link}));
      }
      else {
        hasNonLinkText = true;
      }
    }
    this.setState({links: messageLinks, hasNonLinkText: hasNonLinkText});
  }

  componentDidUpdate() {
    if (this.divRef != null)
      this.divRef.current.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
  }

  validURL(str: string) {
    const pattern = new RegExp(/^(https:\/\/)+([a-zA-Z]*\.)?([a-zA-Z]*\.)([a-zA-Z]*)/);
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
    ipcRenderer.invoke('requestDeleteMessage', { channelID: GLOBALS.currentChannel, messageID: this.message_Id} ).then((result: Boolean) => {
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
    ipcRenderer.invoke('sendEditedMessage', { channelID: GLOBALS.currentChannel, messageID: this.message_Id, message: this.state.editedMessage }).then((result: Boolean) => {
      if (result) {
        new AppNotification({ body: 'Message updated', notificationType: NotificationStatusType.success, notificationAudience: NotificationAudienceType.app }).show();
      } else {
        new AppNotification({ body: 'Unable to edit message', notificationType: NotificationStatusType.error, notificationAudience: NotificationAudienceType.app }).show();
      }
    });
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
        if (this.validURL(word)) messageParts.push(<Link target='_blank' href={word}>{word}</Link>);
        else messageParts.push(word);
      });

      messageContentObject.push(<Typography className='Message_Content'>{messageParts}</Typography>);
    }

    this.state.links.forEach(link => {
      if (link.type == 'image')
        messageContentObject.push(<MessageImage key={link.url} message={link.url} src={link.url} />);
      else if (link.type == 'video')
        messageContentObject.push(<MessageVideo key={link.url} message={link.url} src={link.url} />);
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
