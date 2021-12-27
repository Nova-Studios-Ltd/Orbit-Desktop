import { Typography } from '@mui/material';
import React, { Ref } from 'react';
import type { IMessageCanvasProps, IMessageCanvasState, IMessageProps } from 'types/interfaces';
import Message from './Message';

export default class MessageCanvas extends React.Component<IMessageCanvasProps> {
  state: IMessageCanvasState;
  bottomDivRef: Ref<HTMLDivElement>;

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

  append(message: IMessageProps, isUpdate: boolean, refreshList: boolean) {
    if (this.state.messages.length > 0)
    {
      this.setState((prevState: IMessageCanvasState) => {
        const oldState = prevState;
        if (isUpdate)
          oldState.messages.push(new Message(message));
        else
          oldState.messages.unshift(new Message(message));

        if (refreshList)
          this.setState({messages: []});
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
    const messagesEmptyPromptClassNames = this.isMessagesListEmpty() ? 'AdaptiveText MessagesEmptyPrompt' : 'AdaptiveText MessagesEmptyPrompt Hidden';

    return (
      <div className='MessageCanvas'>
        <div>
          {messagesToRender}
        </div>
        <div className='MessageCanvas_Bottom' ref={this.bottomDivRef}/>
        <Typography className={messagesEmptyPromptClassNames} variant='subtitle1'>No Messages Yet</Typography>
      </div>
    );
  }
}
