import React from 'react';
import Message from './Message';
import GLOBALS from 'shared/globals';
import { IMessageCanvasProps } from 'dataTypes/interfaces';

export default class MessageCanvas extends React.Component {
  constructor(props: IMessageCanvasProps) {
    super(props);
    props.init(this);
    this.append = this.append.bind(this);
    this.remove = this.remove.bind(this);
    this.edit = this.edit.bind(this);
  }

  state = {
    messages: [] as Array<Message>
  }

  append(message: Message) {
    if (this.state.messages.length > 0)
    {
      let oldState = this.state;
      oldState.messages.push(message);
      this.setState({messages: oldState.messages});
    }
    else {
      this.setState({messages: [message]});
    }
  }

  remove(id: string) {
    let oldState = this.state;
    let index = oldState.messages.findIndex(e => e.messageUUID === id);
    if (index > -1) {
      oldState.messages.splice(index, 1);
      this.setState({messages: []});
      this.setState({messages: oldState.messages});
    }
  }

  edit(id: string, newMessage: string) {
    let oldState = this.state;
    let index = oldState.messages.findIndex(e => e.messageUUID == id);
    console.log(index);
    if (index > -1) {
      oldState.messages[index].message = newMessage;
      this.setState({messages: oldState.messages});
    }
  }

  clear() {
    this.setState({messages: []});
  }

  render() {
    const messagesToRender = this.state.messages.map((m, key) => (<Message key={key} message={m.message} author={m.author} avatarSrc={m.avatarSrc} authorUUID={m.authorUUID} messageUUID={m.messageUUID} />));
    return (
      <div className='MessageCanvas'>
        {messagesToRender}
      </div>
    );
  }
}
