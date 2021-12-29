import React from 'react';
import { ExtendButtonBase, ListItemButton, ListItemButtonTypeMap, ListItemIcon, ListItemText} from '@mui/material';

interface IHybridListItem {
  className?: string,
  id: string,
  text: string,
  icon: JSX.Element,
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export default class HybridListItem extends React.Component<IHybridListItem> {
  className?: string;
  id: string;
  text: string;
  icon: JSX.Element;

  constructor(props: IHybridListItem) {
    super(props);
    this.className = props.className || '';
    this.id = props.id;
    this.text = props.text;
    this.icon = props.icon;
  }

  render() {
    return(
      <ListItemButton id={this.id} className={this.className} onClick={this.props.onClick}>
        <ListItemIcon>
          {this.icon}
        </ListItemIcon>
        <ListItemText primary={this.text} />
      </ListItemButton>
    );
  }
}
