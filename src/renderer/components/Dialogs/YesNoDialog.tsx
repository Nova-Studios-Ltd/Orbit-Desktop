import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grow } from "@mui/material";

import type { IYesNoDialogProps } from "types/interfaces/components/propTypes/DialogComponentPropTypes";
import { GrowTransition } from "types/transitions";

export default class YesNoDialog extends React.Component<IYesNoDialogProps> {
  title: string;
  body: string;
  confirmButtonText: string;
  denyButtonText: string;

  constructor(props: IYesNoDialogProps) {
    super(props);
    this.title = props.title || "Confirm Action";
    this.body = props.body || "Information about action";
    this.confirmButtonText = props.confirmButtonText || "OK";
    this.denyButtonText = props.denyButtonText || "Cancel";
  }

  render() {
    return(
      <Dialog open={this.props.show} TransitionComponent={GrowTransition}>
        <DialogTitle>
          {this.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {this.body}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button id="denyButton" onClick={this.props.onDeny}>{this.denyButtonText}</Button>
          <Button id="confirmButton" onClick={this.props.onConfirm}>{this.confirmButtonText}</Button>
        </DialogActions>
      </Dialog>
    );
  }
}
