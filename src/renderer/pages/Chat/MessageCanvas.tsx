import React from 'react';
import Message from './Message';

export default class MessageCanvas extends React.Component {
  append(message: Message) {

  }

  render() {
    return (
      <div className="Chat_MessageCanvas">
        <Message />
        <Message />
        <Message />
        <Message />
        <Message />
        <Message />
        <Message />
        <Message />
        <Message />
        <Message />
        <Message />
        <Message />
        <Message />
        <Message />
      </div>
    );
  }
}
