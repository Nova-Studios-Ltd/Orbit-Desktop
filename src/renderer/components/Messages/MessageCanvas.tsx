import { Typography } from "@mui/material";
import React, { RefObject, UIEvent } from "react";
import Message from "renderer/components/Messages/Message";
import type { IMessageProps } from "renderer/components/Messages/Message";
import type { Dimensions } from "types/types";

interface IMessageCanvasProps {
  messages: Message[],
  onImageClick?: (src: string, dimensions: Dimensions) => void,
  onCanvasScroll?: (yIndex: number, oldestMessageID: string) => void,
  isChannelSelected: boolean
}

interface IMessageCanvasState {

}

export default class MessageCanvas extends React.Component<IMessageCanvasProps, IMessageCanvasState> {
  bottomDivRef?: RefObject<HTMLDivElement>;

  constructor(props: IMessageCanvasProps) {
    super(props);
    this.isMessagesListEmpty = this.isMessagesListEmpty.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.messageUpdated = this.messageUpdated.bind(this);
    this.onImageClick = this.onImageClick.bind(this);

    this.onMessageCanvasScroll = this.onMessageCanvasScroll.bind(this);

    this.bottomDivRef = React.createRef();

    this.isUpdating = true;
  }

  isMessagesListEmpty() {
    return this.props.messages.length < 1;
  }

  scrollToBottom() {
    if (this.bottomDivRef != null && this.bottomDivRef.current != null) {
      this.isUpdating = true;
      this.bottomDivRef.current.scrollIntoView({behavior: "smooth", block: "nearest", inline: "start"});
    }
  }

  messageUpdated() {
    this.scrollToBottom();
  }

  onImageClick(src: string, dimensions: Dimensions) {
    if (this.props != null && this.props.onImageClick != null) this.props.onImageClick(src, dimensions);
  }

  isUpdating: boolean = true;
  isUpdatedCount: number = 0;

  onMessageCanvasScroll(event: UIEvent<HTMLDivElement>) {
    if (this.isUpdating) {
      console.log("Programmatic");
      this.isUpdatedCount++;
      if (this.isUpdatedCount >= 10) this.isUpdating = false;
    }
    else {
      // eslint-disable-next-line no-lonely-if
      console.log("User");
      if (this.props != null && this.props.onCanvasScroll != null && this.props.messages.length > 0) this.props.onCanvasScroll(event.currentTarget.scrollTop, this.props.messages[0].message_Id);
    }
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    const messagesToRender = this.props.messages.map((messageProps) => (<Message key={messageProps.hashedKey} message_Id={messageProps.message_Id} author_UUID={messageProps.author_UUID} author={messageProps.author} content={messageProps.content} attachments={messageProps.attachments} timestamp={messageProps.timestamp} avatar={messageProps.avatar} edited={messageProps.edited} editedTimestamp={messageProps.editedTimestamp} encryptedKeys={messageProps.encryptedKeys} iv={messageProps.iv} onUpdate={this.messageUpdated} onImageClick={this.onImageClick} />));
    const PromptElement = () => {
      if (this.isMessagesListEmpty() && this.props.isChannelSelected) {
        return (
          <div className="AdaptiveText StatusPrompt">
            <Typography variant="subtitle1">No Messages Yet</Typography>
            <Typography variant="caption">Type a message to start the conversation!</Typography>
          </div>
        );
      }

      if (!this.props.isChannelSelected) {
        return (
          <div className="AdaptiveText StatusPrompt">
            <Typography variant="subtitle1">No Channel Selected</Typography>
            <Typography variant="caption">Select a channel on the left to get started!</Typography>
          </div>
        )
      }

      return null;
    }
    return (
      <div className="MessageCanvas" onScroll={this.onMessageCanvasScroll}>
        <div>
          {this.props.isChannelSelected ? messagesToRender : null}
        </div>
        <div className="MessageCanvas_Bottom" ref={this.bottomDivRef}/>
        <PromptElement />
      </div>
    );
  }
}
