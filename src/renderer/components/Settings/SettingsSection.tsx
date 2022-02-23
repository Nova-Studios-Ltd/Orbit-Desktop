import { Typography } from "@mui/material";
import React from "react";

import type { ISettingsSectionProps } from "types/interfaces/components/propTypes/SettingsComponentPropTypes";

export default class SettingsSection extends React.Component<ISettingsSectionProps> {
  title: string;

  constructor(props: ISettingsSectionProps) {
    super(props);
    this.title = props.title || "";
  }

  render() {
    return(
      <div className={`Settings_Section ${this.props.className}`}>
        <Typography className="Settings_Section_Title" variant="h5">{this.title}</Typography>
        {this.props.children}
      </div>
    );
  }
}
