import { Typography } from '@mui/material';
import React, { RefObject, UIEvent } from 'react';
import Message from 'renderer/components/Messages/Message';
import type { IMessageProps } from 'renderer/components/Messages/Message';
import type { Dimensions } from 'types/types';

interface IMessageCanvasProps {
  init: (canvas: MessageCanvas) => void,
  onImageClick?: (src: string, dimensions: Dimensions) => void,
  onCanvasScroll?: (yIndex: number, oldestMessageID: string) => void,
  isChannelSelected: boolean
}

interface IMessageCanvasState {
  messages: Array<Message>
}

export default class MessageCanvas extends React.Component<IMessageCanvasProps> {
  state: IMessageCanvasState;
  bottomDivRef?: RefObject<HTMLDivElement>;

  constructor(props: IMessageCanvasProps) {
    super(props);
    props.init(this);
    this.append = this.append.bind(this);
    this.appendAll = this.appendAll.bind(this);
    this.remove = this.remove.bind(this);
    this.edit = this.edit.bind(this);
    this.clear = this.clear.bind(this);
    this.isMessagesListEmpty = this.isMessagesListEmpty.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.messageUpdated = this.messageUpdated.bind(this);
    this.onImageClick = this.onImageClick.bind(this);

    this.onMessageCanvasScroll = this.onMessageCanvasScroll.bind(this);

    this.bottomDivRef = React.createRef();

    this.isUpdating = true;

    this.state = {
      messages: []
    }
  }

  appendAll(messages: IMessageProps[]) {
    this.setState((prevState: IMessageCanvasState) => {
      const oldState = prevState;
      for (let m = 0; m < messages.length; m++) {
        const message = messages[m];
        if (oldState.messages.length > 0)
          oldState.messages.unshift(new Message(message));
        else
          oldState.messages = [new Message(message)];
      }
      return ({messages: oldState.messages});
    });
  }

  append(message: IMessageProps, isUpdate: boolean) {
    if (this.state.messages.length > 0)
    {
      this.setState((prevState: IMessageCanvasState) => {
        const oldState = prevState;
        if (isUpdate)
          oldState.messages.push(new Message(message));
        else
          oldState.messages.unshift(new Message(message));
        return ({messages: oldState.messages});
      })
    }
    else {
      this.setState({messages: [message]});
    }
  }

  appendTop(message: IMessageProps) {
    if (this.state.messages.length > 0)
    {
      this.setState((prevState: IMessageCanvasState) => {
        const oldState = prevState;
        oldState.messages.unshift(new Message(message));
        return ({messages: oldState.messages});
      })
    }
    else {
      this.setState({messages: [message]});
    }
  }

  remove(id: string) {
    const oldState = this.state;
    const index = oldState.messages.findIndex(e => e.message_Id === id);
    if (index > -1) {
      oldState.messages.splice(index, 1);
      this.setState({messages: oldState.messages});
    }
  }

  edit(id: string, newMessage: IMessageProps) {
    this.setState((prevState: IMessageCanvasState) => {
      const index = prevState.messages.findIndex(e => e.message_Id == id);
      if (index > -1) {
        const m = prevState.messages[index];
        m.content = newMessage.content;
        m.edited = true;
        m.editedTimestamp = newMessage.editedTimestamp;
        m.hashedKey = `${m.message_Id}_${m.timestamp}_${m.editedTimestamp}}`;
        prevState.messages[index] = m;
      }
      return ({
        messages: prevState.messages
      });
    });
  }

  clear() {
    this.setState({ messages: [] });
  }

  isMessagesListEmpty() {
    return this.state.messages.length < 1;
  }

  scrollToBottom() {
    if (this.bottomDivRef != null && this.bottomDivRef.current != null) {
      this.isUpdating = true;
      this.bottomDivRef.current.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
    }
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  messageUpdated() {
    this.scrollToBottom();
  }

  onImageClick(src: string, dimensions: Dimensions) {
    if (this.props != null && this.props.onImageClick != null) this.props.onImageClick(src, dimensions);
  }

  isUpdating: boolean = true;
  isUpdatedCount: number = 0;

  onMessageCanvasScroll(event: UIEvent<HTMLDivElement>) {
    if (this.isUpdating) {
      console.log("Programmatic");
      this.isUpdatedCount++;
      if (this.isUpdatedCount >= 10) this.isUpdating = false;
    }
    else {
      // eslint-disable-next-line no-lonely-if
      console.log("User");
      if (this.props != null && this.props.onCanvasScroll != null && this.state.messages.length > 0) this.props.onCanvasScroll(event.currentTarget.scrollTop, this.state.messages[0].message_Id);
    }
  }

  render() {
    const messagesToRender = this.state.messages.map((messageProps) => (<Message key={messageProps.hashedKey} message_Id={messageProps.message_Id} author_UUID={messageProps.author_UUID} author={messageProps.author} content={messageProps.content} attachments={messageProps.attachments} timestamp={messageProps.timestamp} avatar={messageProps.avatar} edited={messageProps.edited} editedTimestamp={messageProps.editedTimestamp} encryptedKeys={messageProps.encryptedKeys} iv={messageProps.iv} onUpdate={this.messageUpdated} onImageClick={this.onImageClick} />));
    const PromptElement = () => {
      if (this.isMessagesListEmpty() && this.props.isChannelSelected) {
        return (
          <div className='AdaptiveText StatusPrompt'>
            <Typography variant='subtitle1'>No Messages Yet</Typography>
            <Typography variant='caption'>Type a message to start the conversation!</Typography>
          </div>
        );
      }

      if (!this.props.isChannelSelected) {
        return (
          <div className='AdaptiveText StatusPrompt'>
            <Typography variant='subtitle1'>No Channel Selected</Typography>
            <Typography variant='caption'>Select a channel on the left to get started!</Typography>
          </div>
        )
      }

      return null;
    }
    return (
      <div className='MessageCanvas' onScroll={this.onMessageCanvasScroll}>
        <div>
          {this.props.isChannelSelected ? messagesToRender : null}
        </div>
        <div className='MessageCanvas_Bottom' ref={this.bottomDivRef}/>
        <PromptElement />
      </div>
    );
  }
}
