import { NotificationAudienceType, NotificationStatusType } from "types/enums";
import type { INotificationProps } from "types/interfaces"

export class NotificationStruct implements INotificationProps {
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
