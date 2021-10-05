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
    this.setState({messages: this.state.messages, message});
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
        {this.state.messages}
      </div>
    );
  }
}
