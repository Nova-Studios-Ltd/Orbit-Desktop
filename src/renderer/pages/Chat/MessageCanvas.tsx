import React from 'react';
import Message from './Message';

export default class MessageCanvas extends React.Component {
  constructor(props: any) {
    super(props);
    props.init(this);
    this.append = this.append.bind(this);
    this.remove = this.remove.bind(this);
    this.edit = this.edit.bind(this);
    this.printMessageState = this.printMessageState.bind(this);
  }

  state = {
    messages: [] as Array<Message>
  }

  printMessageState() {
    console.log(`Message State: ${this.state.messages}`);
  }

  append(message: Message) {
    console.log(`Canvas received message: ${message.message}`);
    if (this.state.messages.length > 0)
    {
      var oldState = this.state;
      oldState.messages.push(message);
      this.setState({messages: oldState.messages});
    }
    else {
      this.setState({messages: [message]}, () => { this.printMessageState(); });
    }
  }

  remove(uuid: string) {
    const messages = this.state.messages;
    const index = messages.findIndex(e => e.uuid === uuid);
    if (index > -1) {
      const updatedMessages = messages.splice(index, 1);
      this.setState({messages: updatedMessages});
    }
  }

  edit(uuid: string, newMessage: string) {
    console.warn("Message editing is not implemented");
  }

  render() {
    console.log(this.state.messages);
    const messagesToRender = this.state.messages.map((m, key) => (<Message key={key} message={m.message} author={m.author} avatarSrc={m.avatarSrc} uuid={m.uuid}/>));
    console.log(`${messagesToRender.length}/${this.state.messages.length}`);
    return (
      <div className="Chat_MessageCanvas">
        {messagesToRender}
      </div>
    );
  }
}
