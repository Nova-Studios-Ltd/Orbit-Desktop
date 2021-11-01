import React from 'react';
import { NotificationAudienceType, NotificationStatusType } from '../../../dataTypes/enums';
import { INotificationProps } from '../../../dataTypes/interfaces';
import { toast } from 'react-toastify';
import { ipcRenderer } from 'shared/helpers';
import { Typography } from '@mui/material';
import GLOBALS from 'shared/globals';

export default class AppNotification {
  readonly title?: string;
  readonly body?: string;
  readonly playSound?: Boolean;
  readonly notificationType?: NotificationStatusType;
  readonly notificationAudience?: NotificationAudienceType;

  constructor(props: INotificationProps) {
    if (props.title != null) {
      this.title = props.title;
    }
    else {
      this.title = '';
    }

    if (props.body != null) {
      this.body = props.body;
    }
    else {
      this.body = '';
    }

    if (props.playSound != null) {
      this.playSound = props.playSound;
    }
    else {
      this.playSound = false;
    }

    if (props.notificationType != null) {
      this.notificationType = props.notificationType;
    }
    else {
      this.notificationType = NotificationStatusType.default;
    }

    if (props.notificationAudience != null) {
      this.notificationAudience = props.notificationAudience;
    }
    else {
      this.notificationAudience = NotificationAudienceType.app;
    }
    console.log(this);
  }

  private sendAppToast() {
    let toastElement = null;
    if (this.title.length > 0) {
      toastElement = () => {
        return(
          <div className='Notification_Container'>
            <Typography className='Notification_Title' variant='subtitle1'>{this.title}</Typography>
            <Typography className='Notification_Body' variant='caption'>{this.body}</Typography>
          </div>
        );
      };
      console.log(toastElement);
    }
    else {
      toastElement = this.body;
    }

    switch(this.notificationType) {
      case NotificationStatusType.info:
        toast.info(toastElement);
        break;
      case NotificationStatusType.success:
        toast.success(toastElement);
        break;
      case NotificationStatusType.warning:
        toast.warning(toastElement);
        break;
      case NotificationStatusType.error:
        toast.error(toastElement);
        break;
      default:
        toast(toastElement);
        break;
    }
  }

  private sendSystemNotification() {
    ipcRenderer.send('toast', this);
  }

  show() {
    switch(this.notificationAudience) {
      case NotificationAudienceType.app:
        this.sendAppToast();
        break;
      case NotificationAudienceType.system:
        this.sendSystemNotification();
        break;
      case NotificationAudienceType.both:
        this.sendAppToast();
        this.sendSystemNotification();
        break;
    }

    if (this.playSound) {
      const sound = new Audio(GLOBALS.NotificationAssetPath);
      if (sound != null) {
        sound.play();
      }
    }
  }

}
