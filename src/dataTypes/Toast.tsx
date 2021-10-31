import React from 'react';
import { Snackbar } from '@mui/material';
import { ToastStausType } from "dataTypes/enums";
import { IToastProps } from "dataTypes/interfaces";

export default class Toast extends React.Component {
  title: string;
  body?: string;
  statusType?: ToastStausType;

  constructor(props: IToastProps) {
    super(props);
    this.title = props.title;

    if (props.body != null) {
      this.body = props.body;
    }
    else {
      this.body = "";
    }

    if (props.statusType != null) {
      this.statusType = props.statusType;
    }
    else {
      this.statusType = ToastStausType.info;
    }
  }


  render() {
    return(
      <Snackbar />
    );
  }
}
