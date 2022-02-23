import React from "react";
import { Typography } from "@mui/material";

import type { IFormHeaderProps } from "types/interfaces/components/propTypes/FormComponentPropTypes";

export default class FormHeader extends React.Component<IFormHeaderProps> {
  heading?: string;
  body?: string;

  constructor(props: IFormHeaderProps) {
    super(props);
    this.heading = props.heading || "";
    this.body = props.body || "";
  }

  render() {
    return (
      <div>
        <Typography className="Generic_Form_Item" variant="h4">{this.heading}</Typography>
        <Typography className="Generic_Form_Item" variant="body1">{this.body}</Typography>
      </div>
    );
  }
}
