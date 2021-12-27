import React from 'react';
import { Typography } from '@mui/material';
import { FormStatusType } from 'types/enums';

interface IFormStatusFieldProps {
  message?: string,
  type?: FormStatusType
}

export default class FormStatusField extends React.Component {
  static props: IFormStatusFieldProps;

  constructor(props: IFormStatusFieldProps) {
    super(props);
    this.props = props;
  }

  getType()
  {
    const { type } = this.props;
    switch (type)
    {
      case FormStatusType.info:
        return '#000000'
      case FormStatusType.warn:
        return '#f2c41d'
      case FormStatusType.error:
        return '#ff0011'
      case FormStatusType.success:
        return '#27D507'
      default:
        return '#000000'
    }
  }

  render() {
    const styles = {
      color: this.getType()
    }

    return (
      <div>
        <Typography className='Generic_Form_Item' variant='body1' style={styles}>{this.props.message}</Typography>
      </div>
    );
  }
}
