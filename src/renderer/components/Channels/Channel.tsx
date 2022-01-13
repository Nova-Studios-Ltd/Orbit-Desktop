import React, { MouseEvent } from 'react';
import { Button, Card, Typography, Avatar, Menu, MenuItem, ButtonBase, Dialog, DialogContent, DialogActions, DialogTitle, IconButton, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import GLOBALS from 'shared/globals'
import { ipcRenderer, setDefaultChannel } from 'shared/helpers';
import { ChannelType } from 'types/enums';
import YesNoDialog from 'renderer/components/Dialogs/YesNoDialog';
import FormTextField from 'renderer/components/Form/FormTextField';

export interface IChannelProps {
  table_Id: string,
  owner_UUID?: string,
  isGroup: ChannelType,
  channelName: string,
  channelIcon?: string,
  members?: string[],
}

export interface IChannelUpdateProps {
  channelID: string,
  channelName?: string,
  channelIcon?: boolean,
  members?: string[],
}

interface IChannelState {
  contextMenuAnchorPos: { x: 0, y: 0},
  contextMenuOpen: boolean,
  confirmChannelDeletionDialogOpen: boolean,
  editDialogOpen: boolean,
  editDialogChannelName: string,
  editDialogChannelIconPath: string | undefined,
  editDialogChannelIconPreview: string | undefined,
  editDialogChannelRecipients: string
}


export default class Channel extends React.Component<IChannelProps> {
  state: IChannelState;
  channelName: string;
  channelType: ChannelType;
  channelID: string;
  channelIcon?: string;
  channelMembers?: string[];
  channelOwner?: string;

  constructor(props: IChannelProps) {
    super(props);
    this.channelName = props.channelName;
    this.channelType = props.isGroup ? ChannelType.Group : ChannelType.User;
    this.channelID = props.table_Id;
    this.channelIcon = props.channelIcon;
    this.channelMembers = props.members || [];
    this.channelOwner = props.owner_UUID || undefined;

    this.channelClicked = this.channelClicked.bind(this);
    this.channelRightClicked = this.channelRightClicked.bind(this);
    this.menuItemClicked = this.menuItemClicked.bind(this);
    this.closeContextMenu = this.closeContextMenu.bind(this);
    this.removeUserFromThisChannel = this.removeUserFromThisChannel.bind(this);
    this.closeChannelDeletionDialog = this.closeChannelDeletionDialog.bind(this);
    this.closeChannelEditDialog = this.closeChannelEditDialog.bind(this);
    this.channelEditDialogChanged = this.channelEditDialogChanged.bind(this);
    this.submitChannelEdits = this.submitChannelEdits.bind(this);
    this.chooseChannelIcon = this.chooseChannelIcon.bind(this);
    this.isOwner = this.isOwner.bind(this);

    this.state = {
      contextMenuAnchorPos: { x: 0, y: 0},
      contextMenuOpen: false,
      confirmChannelDeletionDialogOpen: false,
      editDialogOpen: false,
      editDialogChannelName: this.channelName,
      editDialogChannelIconPath: this.channelIcon,
      editDialogChannelIconPreview: this.channelIcon,
      editDialogChannelRecipients: this.channelMembers.toString(),
    };
  }

  channelRightClicked(event: MouseEvent<HTMLButtonElement>) {
    this.setState({
      contextMenuOpen: true,
      contextMenuAnchorPos: { x: event.clientX, y: event.clientY },
    });
  }

  isOwner() {
    return GLOBALS.userData.uuid == this.channelOwner;
  }

  canEdit() {
    return this.isOwner() && this.props.isGroup;
  }

  async channelClicked() {
    GLOBALS.currentChannel = this.channelID;
    setDefaultChannel(this.channelID);
    ipcRenderer.send('GETMessages', GLOBALS.currentChannel, GLOBALS.userData);
  }

  async menuItemClicked(event: MouseEvent<HTMLLIElement>) {
    switch (event.currentTarget.id) {
      case 'edit':
        this.setState({ editDialogOpen: true });
        break;
      case 'hide':
        break;
      case 'delete':
        this.setState({ confirmChannelDeletionDialogOpen: true });
        break;
    }

    this.closeContextMenu();
  }

  chooseChannelIcon() {
    ipcRenderer.invoke('OpenFile').then((data: { path: string, contents?: Buffer }) => {
      if (data != undefined) {
        this.setState(() => {
          let preview = null;
          if (data.contents != null) {
            preview = URL.createObjectURL(new Blob([Uint8Array.from(data.contents)]));
          }
          else {
            preview = this.channelIcon;
          }
          console.log(preview);
          return { editDialogChannelIconPath: data.path, editDialogChannelIconPreview: preview }
        });
      }
    });
  }

  closeContextMenu() {
    this.setState({ contextMenuOpen: false, contextMenuAnchorPos: { x: 0, y: 0} });
  }

  closeChannelDeletionDialog() {
    this.setState({ confirmChannelDeletionDialogOpen: false });
  }

  closeChannelEditDialog() {
    this.setState({
      editDialogOpen: false,
      editDialogChannelName: this.channelName,
      editDialogChannelIconPath: this.channelIcon,
      editDialogChannelIconPreview: this.channelIcon,
      editDialogChannelRecipients: this.channelMembers?.toString(),
    });
  }

  channelEditDialogChanged(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ [event.target.name]: event.target.value });
  }

  submitChannelEdits() {
    if (this.isOwner()) {
      if (this.state.editDialogChannelName != this.channelName) {
        ipcRenderer.send('UPDATEChannelName', this.channelID, this.state.editDialogChannelName);
      }
      if (this.state.editDialogChannelIconPath != this.channelIcon) {
        ipcRenderer.send('UPDATEChannelIcon', this.channelID, this.state.editDialogChannelIconPath);
      }
    }
    this.closeChannelEditDialog();
  }

  removeUserFromThisChannel() {
    if (this.channelType == ChannelType.Group)
      ipcRenderer.send(
        'REMOVEChannelMember',
        this.channelID,
        GLOBALS.userData.uuid
      );
    else ipcRenderer.send('DELETEChannel', this.channelID);
    this.closeChannelDeletionDialog();
  }

  render() {
    const LeaveChannelPromptTextGroup =
      'You will no longer have access to this channel unless you are reinvited. If you are the last person in this channel, it will be permanently lost forever!';
    const LeaveChannelPromptTextUser =
      'This will only delete your copy of the conversation and remove you from the channel. You will have to re-add the recipient to chat with them again.';
    const LeaveChannelButtonText =
      this.channelType == ChannelType.Group ? 'Leave' : 'Delete';
    const LeaveChannelPromptText =
      this.channelType == ChannelType.Group
        ? LeaveChannelPromptTextGroup
        : LeaveChannelPromptTextUser;

    const DialogActionButtons = () => {
      if (this.canEdit()) return (
        <div>
          <Button id='cancelButton' onClick={this.closeChannelEditDialog}>
            Cancel
          </Button>
          <Button id='editButton' onClick={this.submitChannelEdits}>
            Save
          </Button>
        </div>
      )
      return (
        <div>
          <Button id='cancelButton' onClick={this.closeChannelEditDialog}>
            Close
          </Button>
        </div>
      )
    }

    return (
      <div className='Channel'>
          <ButtonBase
            className='ChannelInnerButtonBase'
            onClick={this.channelClicked}
            onContextMenu={this.channelRightClicked}
          >
            <div className='ChannelInner'>
              <div className='ChannelLeft'>
                <Avatar className='ChannelIcon' src={this.channelIcon} />
              </div>
              <div className='ChannelRight'>
                <Typography className='ChannelCaption' variant='h6'>
                  {this.channelName}
                </Typography>
              </div>
            </div>
          </ButtonBase>
        <Menu
          id='channel-dropdown-menu'
          anchorReference='anchorPosition'
          anchorPosition={{ top: this.state.contextMenuAnchorPos.y, left: this.state.contextMenuAnchorPos.x }}
          open={this.state.contextMenuOpen}
          onClose={this.closeContextMenu}
        >
          <MenuItem id='edit' onClick={this.menuItemClicked}>
            Edit
          </MenuItem>
          <MenuItem id='hide' onClick={this.menuItemClicked} disabled>
            Hide
          </MenuItem>
          <MenuItem id='delete' onClick={this.menuItemClicked}>
            {LeaveChannelButtonText}
          </MenuItem>
        </Menu>
        <Dialog open={this.state.editDialogOpen}>
          <DialogTitle>Edit Channel &quot;{this.channelName}&quot;</DialogTitle>
          <DialogContent style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div>
              <IconButton className='OverlayContainer' disabled={!this.canEdit()} onClick={this.chooseChannelIcon}>
                <Avatar
                  sx={{ width: 64, height: 64 }}
                  src={this.state.editDialogChannelIconPreview}
                />
                <AddIcon fontSize='large' className='Overlay' />
              </IconButton>
            </div>
            <div>
              <FormTextField disabled={!this.canEdit()} id='editDialogChannelName' label='Channel Name' placeholder='New Channel Name' value={this.state.editDialogChannelName} onChange={this.channelEditDialogChanged} />
              <FormTextField disabled id='editDialogChannelRecipients' label='Channel Recipients' value={this.state.editDialogChannelRecipients} onChange={this.channelEditDialogChanged}/>
              <FormTextField disabled label='Channel UUID' value={this.channelID}/>
            </div>
            </DialogContent>
          <DialogActions>
            <DialogActionButtons />
          </DialogActions>
        </Dialog>
        <YesNoDialog
          title={`Confirm ${LeaveChannelButtonText} Channel`}
          body={LeaveChannelPromptText}
          confirmButtonText={LeaveChannelButtonText}
          denyButtonText='Cancel'
          onConfirm={this.removeUserFromThisChannel}
          onDeny={this.closeChannelDeletionDialog}
          show={this.state.confirmChannelDeletionDialogOpen}
        ></YesNoDialog>
      </div>
    );
  }
}
