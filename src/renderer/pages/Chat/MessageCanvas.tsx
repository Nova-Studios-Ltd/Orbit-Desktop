import React from 'react';
import Message from './Message';

export default class MessageCanvas extends React.Component {
  state = {
    messages: [] as any
  }

  append(message: Message) {
    this.setState({messages: this.state.messages.push(message)});
  }

  render() {
    return (
      <div className="Chat_MessageCanvas">
        {this.state.messages}
      </div>
    );
  }
}
