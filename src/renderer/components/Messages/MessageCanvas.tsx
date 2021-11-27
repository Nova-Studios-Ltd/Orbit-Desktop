import React from 'react';
import { IMessageCanvasProps } from 'types/interfaces';
import Message from './Message';

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

  append(message: Message, isUpdate: boolean, refreshList: boolean) {
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
    console.log(index);
    if (index > -1) {
      let m = oldState.messages[index];
      oldState.messages[index] = new Message({ message_Id: m.message_Id, author_UUID: m.author_UUID, author: m.author, content: newMessage, timestamp: m.timestamp, avatar: m.avatar } as IMessageProps);
      this.setState({messages: []});
      this.setState({messages: oldState.messages});
    }
  }

  clear() {
    this.setState({messages: []});
  }

  render() {
    const messagesToRender = this.state.messages.map((m, key) => (<Message key={key} content={m.content} author={m.author} avatar={m.avatar} author_UUID={m.author_UUID} message_Id={m.message_Id} />));
    /*let messagesToRender = [];
    for (let i = this.state.messages.length; i > 0; i--) {
      const m = this.state.messages[i];
      if (m == undefined) continue;
      messagesToRender.push(<Message key={i} message={m.message} author={m.author} avatarSrc={m.avatarSrc} authorUUID={m.authorUUID} messageUUID={m.messageUUID} />);
    }*/
    return (
      <div className='MessageCanvas'>
        {messagesToRender}
      </div>
    );
  }
}
