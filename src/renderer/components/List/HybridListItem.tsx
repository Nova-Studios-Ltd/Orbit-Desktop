import React from 'react';
import { ListItem, ListItemIcon, ListItemText} from '@mui/material';
import type { IHybridListItem } from 'types/interfaces';

export default class HybridListItem extends React.Component<IHybridListItem> {
  className: string;
  id: string;
  text: string;
  icon: JSX.Element;

  constructor(props: IHybridListItem) {
    super(props);
    this.className = props.className;
    this.id = props.id;
    this.text = props.text;
    this.icon = props.icon;
  }

  render() {
    return(
      <ListItem id={this.id} className={this.className} button onClick={this.props.onClick}>
        <ListItemIcon>
          {this.icon}
        </ListItemIcon>
        <ListItemText primary={this.text} />
      </ListItem>
    );
  }
}
