import type { NotificationStatusType, NotificationAudienceType } from "types/enums";

export interface INotificationProps {
  title?: string,
  body?: string,
  playSound?: boolean,
  notificationAssetPath?: string,
  notificationType?: NotificationStatusType,
  notificationAudience?: NotificationAudienceType,
  onClick?: () => void
}
