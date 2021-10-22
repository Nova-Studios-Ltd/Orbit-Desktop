import React from 'react';
import { Typography } from '@mui/material';
import { FormStatusFieldProps } from 'renderer/interfaces';
import { FormStatusType } from './FormStatusTypes';

export default class FormStatusField extends React.Component {
  constructor(props: FormStatusFieldProps) {
    super(props);
    this.state = {message: props.message as string, type: props.type as FormStatusType};
  }

  state = {
    message: "",
    type: null as unknown as FormStatusType
  }

  getType()
  {
    const { type } = this.state;
    switch (type)
    {
      case FormStatusType.info:
        return "#000000"
      case FormStatusType.warn:
        return "#f2c41d"
      case FormStatusType.error:
        return "#ff0011"
      default:
        return "#000000"
    }
  }

  update(message: string, type: FormStatusType) {
    this.setState({"message": message, "type": type});
  }

  render() {
    const styles = {
      color: this.getType()
    }

    return (
      <div>
      <Typography className="Generic_Form_Item" variant="body1" style={styles}>{this.state.message}</Typography>
    </div>
    );
  }
}
