import React from 'react';
import GLOBALS from 'shared/globals';
import { IMessageCanvasProps } from 'types/interfaces';
import Message from './Message';

export default class MessageCanvas extends React.Component {
  constructor(props: IMessageCanvasProps) {
    super(props);
    props.init(this);
    this.append = this.append.bind(this);
  }

  state = {
    messages: [] as Array<Message>
  }

  append(message: Message, isUpdate: boolean, refreshList: boolean) {
    if (this.state.messages.length > 0)
    {
      let oldState = this.state;
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
