import React from "react";
import { Typography } from "@mui/material";
import { FormStatusType } from "types/enums";
import { AppTheme } from "renderer/AppTheme";

interface IFormStatusFieldProps {
  message?: string,
  type?: FormStatusType
}

export default class FormStatusField extends React.Component<IFormStatusFieldProps> {
  getType()
  {
    const { type } = this.props;
    switch (type)
    {
      case FormStatusType.info:
        return AppTheme().palette.text.primary;
      case FormStatusType.warn:
        return AppTheme().palette.warning.main;
      case FormStatusType.error:
        return AppTheme().palette.error.main;
      case FormStatusType.success:
        return AppTheme().palette.success.main;
      default:
        return "#000000"
    }
  }

  render() {
    const styles = {
      color: this.getType()
    }

    return (
      <div>
        <Typography className="Generic_Form_Item" variant="body1" style={styles}>{this.props.message}</Typography>
      </div>
    );
  }
}
