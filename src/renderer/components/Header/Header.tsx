import React from "react";
import { Icon, IconButton, Typography } from "@mui/material";

import type { IHeaderProps } from "types/interfaces/components/propTypes/HeaderComponentPropTypes";

export default class Header extends React.Component<IHeaderProps> {

  render() {

    const classNames = `Header ${this.props.className}`;

    const IconElement = () => {
      if (this.props.icon != null) {
        if (this.props.onClick != null) {
          return (
            <IconButton className="Header_IconButton" onClick={this.props.onClick}>{this.props.icon}</IconButton>
          );
        }

        return (
          <Icon className="Header_Icon">{this.props.icon}</Icon>
        );

      }
      return null;
    }

    return (
      <div className={classNames} style={this.props.style}>
        <IconElement />
        <Typography variant="h5" className="Header_Caption">{this.props.caption}</Typography>
        <div className="Header_Misc">
          {this.props.children}
        </div>
      </div>
    );
  }
}
