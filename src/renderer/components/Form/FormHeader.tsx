import React from 'react';
import { Typography } from '@mui/material';
import { FormHeaderProps } from 'renderer/interfaces';

export default class FormHeader extends React.Component {
  heading: string;
  body: string;

  constructor(props: FormHeaderProps) {
    super(props);
    this.heading = props.heading;
    this.body = props.body;
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
