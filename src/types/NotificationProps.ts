import { NotificationAudienceType, NotificationStatusType } from "./enums";
import { INotificationProps } from "./interfaces"

export class NotificationProps implements INotificationProps {
  title?: string;
  body?: string;
  playSound?: Boolean;
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
