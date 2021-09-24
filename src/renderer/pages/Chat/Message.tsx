import React from 'react';

export default class Message extends React.Component {
  uuid: string;
  senderName: string;
  message: string;
  avatarSrc: string;

  constructor(props: any) {
    super(props);
    this.uuid = props.uuid;
    this.senderName = props.senderName;
    this.message = props.message;
    this.avatarSrc = props.avatarSrc;
  }

  render() {
    return (
      <div className="Chat_Message">

      </div>
    );
  }
}
