import React from 'react';
import Message from './Message';

export default class MessageCanvas extends React.Component {
  constructor(props: any) {
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
    let messages = this.state.messages;
    let index = messages.findIndex(e => e.uuid === id);
    if (index > -1) {
      messages.splice(index, 1);
      this.setState({messages: [...messages]});
    }
  }

  edit(id: string, newMessage: string) {
    console.warn("Message editing is not implemented");
  }

  render() {
    console.log(this.state.messages);
    const messagesToRender = this.state.messages.map((m, key) => (<Message key={key} message={m.message} author={m.author} avatarSrc={m.avatarSrc} uuid={m.uuid} />));
    console.log(`${messagesToRender.length}/${this.state.messages.length}`);
    return (
      <div className="Chat_MessageCanvas">
        {messagesToRender}
      </div>
    );
  }
}
