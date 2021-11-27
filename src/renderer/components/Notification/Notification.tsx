import React from 'react';
import { NotificationAudienceType, NotificationStatusType } from 'types/enums';
import { INotificationProps } from 'types/interfaces';
import { toast } from 'react-toastify';
import { ipcRenderer } from 'shared/helpers';
import { Typography } from '@mui/material';
import GLOBALS from 'shared/globals';
import { NotificationStruct } from 'structs/NotificationProps';

export default class AppNotification {
  readonly title?: string;
  readonly body?: string;
  readonly playSound?: Boolean;
  readonly notificationType?: NotificationStatusType;
  readonly notificationAudience?: NotificationAudienceType;

  constructor(props: NotificationStruct) {
    this.title = props.title || '';
    this.body = props.body || '';
    this.playSound = props.playSound || false;
    this.notificationType = props.notificationType || NotificationStatusType.default;
    this.notificationAudience = props.notificationAudience || NotificationAudienceType.app;
  }

  private sendAppToast() {
    let toastElement = null;
    if (this.title != null && this.title.length > 0) {
      toastElement = () => {
        return(
          <div className='Notification_Container'>
            <Typography className='Notification_Title' variant='subtitle1'>{this.title}</Typography>
            <Typography className='Notification_Body' variant='caption'>{this.body}</Typography>
          </div>
        );
      };
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
