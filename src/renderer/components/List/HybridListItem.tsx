import React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';

export interface IHybridListItemProps {
  className?: string,
  id?: string,
  text?: string,
  icon?: JSX.Element,
  selected?: boolean,
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void,
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void
}

export interface IHybridListItemSkeleton {
  className?: string,
  id?: string,
  text?: string,
  icon?: JSX.Element,
  selectable?: boolean,
  isDivider?: boolean,
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void,
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void
}

export default class HybridListItem extends React.Component<IHybridListItemProps> {
  className?: string;
  id: string;
  text: string;
  icon: JSX.Element | undefined;

  constructor(props: IHybridListItemProps) {
    super(props);
    this.className = props.className || '';
    this.id = props.id || '';
    this.text = props.text || '';
    this.icon = props.icon || undefined;
  }

  render() {
    return(
      <ListItemButton id={this.id} className={this.className} selected={this.props.selected} onClick={this.props.onClick} onContextMenu={this.props.onContextMenu}>
        <ListItemIcon>
          {this.icon}
        </ListItemIcon>
        <ListItemText primary={this.text} />
      </ListItemButton>
    );
  }
}
