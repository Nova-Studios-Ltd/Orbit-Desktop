import React from 'react';
import { ListItem, ListItemIcon, ListItemText} from '@mui/material';
import type { IHybridListItem } from 'types/interfaces';

export default class HybridListItem extends React.Component {
  className: string;
  id: string;
  text: string;
  icon: any;

  constructor(props: IHybridListItem) {
    super(props);
    this.className = props.className;
    this.id = props.id;
    this.text = props.text;
    this.icon = props.icon;

    this.onClick = this.onClick.bind(this);
  }

  onClick(event: any) {
    this.props.onClick(event);
  }

  render() {
    return(
      <ListItem id={this.id} className={this.className} button onClick={this.onClick}>
        <ListItemIcon>
          {this.icon}
        </ListItemIcon>
        <ListItemText primary={this.text} />
      </ListItem>
    );
  }
}
