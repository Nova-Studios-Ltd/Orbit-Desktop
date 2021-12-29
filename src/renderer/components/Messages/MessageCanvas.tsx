import { Typography } from '@mui/material';
import React, { RefObject } from 'react';
import Message from 'renderer/components/Messages/Message';
import type { IMessageProps } from 'renderer/components/Messages/Message';

interface IMessageCanvasProps {
  init: (canvas: MessageCanvas) => void,
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
    this.remove = this.remove.bind(this);
    this.edit = this.edit.bind(this);
    this.clear = this.clear.bind(this);
    this.isMessagesListEmpty = this.isMessagesListEmpty.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.messageUpdated = this.messageUpdated.bind(this);

    this.bottomDivRef = React.createRef();

    this.state = {
      messages: []
    }
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
    this.setState({messages: []});
  }

  isMessagesListEmpty() {
    return this.state.messages.length < 1;
  }

  scrollToBottom() {
    if (this.bottomDivRef != null)
      this.bottomDivRef.current.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  messageUpdated() {
    this.scrollToBottom();
  }

  render() {
    const messagesToRender = this.state.messages.map((messageProps) => (<Message key={messageProps.hashedKey} message_Id={messageProps.message_Id} author_UUID={messageProps.author_UUID} author={messageProps.author} content={messageProps.content} attachments={messageProps.attachments} timestamp={messageProps.timestamp} avatar={messageProps.avatar} edited={messageProps.edited} editedTimestamp={messageProps.editedTimestamp} onUpdate={this.messageUpdated} />));
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
      <div className='MessageCanvas'>
        <div>
          {this.props.isChannelSelected ? messagesToRender : null}
        </div>
        <div className='MessageCanvas_Bottom' ref={this.bottomDivRef}/>
        <PromptElement />
      </div>
    );
  }
}
