import React from 'react';
import { ListItemButton, ListItemIcon, ListItemText} from '@mui/material';

interface IHybridListItemProps {
  className?: string,
  id: string,
  text: string,
  icon?: JSX.Element,
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void,
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void
}

export default class HybridListItem extends React.Component<IHybridListItemProps> {
  className?: string;
  id: string;
  text: string;
  icon: JSX.Element;

  constructor(props: IHybridListItemProps) {
    super(props);
    this.className = props.className || '';
    this.id = props.id;
    this.text = props.text;
    this.icon = props.icon || undefined;
  }

  render() {
    return(
      <ListItemButton id={this.id} className={this.className} onClick={this.props.onClick} onContextMenu={this.props.onContextMenu}>
        <ListItemIcon>
          {this.icon}
        </ListItemIcon>
        <ListItemText primary={this.text} />
      </ListItemButton>
    );
  }
}
