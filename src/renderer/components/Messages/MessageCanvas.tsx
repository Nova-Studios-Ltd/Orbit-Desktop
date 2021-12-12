import { throwStatement } from '@babel/types';
import { Typography } from '@mui/material';
import React from 'react';
import type { IMessageCanvasProps, IMessageCanvasState, IMessageProps } from 'types/interfaces';
import Message from './Message';

export default class MessageCanvas extends React.Component {
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

    this.bottomDivRef = React.createRef();

    this.state = {
      messages: []
    }
  }

  append(message: IMessageProps, isUpdate: boolean, refreshList: boolean) {
    if (this.state.messages.length > 0)
    {
      const oldState = this.state;
      if (isUpdate)
        oldState.messages.push(message);
      else
        oldState.messages.unshift(message);

      if (refreshList)
        this.setState({messages: []});
      this.setState({messages: oldState.messages});
    }
    else {
      this.setState({messages: [message]});
    }
  }

  remove(id: string) {
    let oldState = this.state;
    let index = oldState.messages.findIndex(e => e.message_Id === id);
    if (index > -1) {
      oldState.messages.splice(index, 1);
      this.setState({messages: []});
      this.setState({messages: oldState.messages});
    }
  }

  edit(id: string, newMessage: string) {
    let oldState = this.state;
    let index = oldState.messages.findIndex(e => e.message_Id == id);
    if (index > -1) {
      let m = oldState.messages[index];
      m.content = newMessage;
      oldState.messages[index] = m;
      this.setState({messages: []});
      this.setState({messages: oldState.messages});
    }
  }

  clear() {
    this.setState({messages: []});
  }

  isMessagesListEmpty() {
    return this.state.messages.length < 1;
  }

  componentDidUpdate() {
    this.bottomDivRef.current.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
  }

  render() {
    const messagesToRender = this.state.messages.map((messageProps, key) => (<Message key={messageProps.message_Id} {...messageProps} />));
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
