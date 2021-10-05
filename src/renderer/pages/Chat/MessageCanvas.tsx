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
      this.setState(previousState => ({messages: [previousState.messages, message]}), () => { this.printMessageState(); });
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
    return (
      <div className="Chat_MessageCanvas">
        {this.state.messages.map(message => (
          <Message message={message.message} author={message.author} avatarSrc={message.avatarSrc} uuid={message.uuid}/>
        ))}
      </div>
    );
  }
}
