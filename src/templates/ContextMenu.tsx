constructor(props) {
  this.state = { anchorEl: null, open: Boolean(this.state.anchorEl) };
}

async menuItemClicked(event: React.ReactElement<any, string | React.JSXElementConstructor<any>>) {
  switch(event.currentTarget.id) {
    case '[Identifier]':
      break;
  }

  this.setState({ open: false, anchorEl: null });
}

closeContextMenu(event: any) {
  this.setState({ open: false, anchorEl: null });
}

render() {
  return(
    <Menu
      id='userdropdown-menu'
      anchorEl={this.state.anchorEl}
      open={this.state.open}
      onClose={this.closeContextMenu}
      >

      <MenuItem id='[ReplaceWithIdentifier]' onClick={(event) => this.menuItemClicked(event)}>[Text]</MenuItem>
    </Menu>
  );
}
