import { Ref } from "react";
import { NotificationAudienceType, NotificationStatusType } from "./enums";
import { IMessageProps, INotificationProps } from "./interfaces"

export class NotificationProps implements INotificationProps {
  title?: string;
  body?: string;
  playSound?: boolean;
  notificationType?: NotificationStatusType;
  notificationAudience?: NotificationAudienceType;

  constructor(title: string, body: string, playSound: boolean, notificationType: NotificationStatusType, notificationAudience?: NotificationAudienceType) {
    this.title = title;
    this.body = body;
    this.playSound = playSound;
    this.notificationType = notificationType;
    this.notificationAudience = notificationAudience;
  }
}

export class MessageProps implements IMessageProps {
  Message_Id: string;
  Author_UUID: string;
  Author: string;
  Content: string;
  Timestamp: string;
  Avatar: string;
  ref: Ref<unknown>;

  constructor(messageUUID: string, authorUUID: string, author: string, message: string, timestamp: string, avatarSrc: string) {
    this.Message_Id = messageUUID;
    this.Author_UUID = authorUUID;
    this.Author = author;
    this.Content = message;
    this.Timestamp = timestamp;
    this.Avatar = avatarSrc;
    this.ref = null;
  }
}
