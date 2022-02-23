import type Channel from "renderer/components/Channels/Channel";
import type { ChannelType } from "types/enums";

export interface IChannelProps {
  table_Id: string,
  owner_UUID?: string,
  isGroup: ChannelType,
  channelName: string,
  channelIcon?: string,
  members?: string[],
  isSelected: boolean,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>, channelID: string) => void
}

export interface IChannelViewProps {
  channels: Channel[],
  selectedChannel?: string,
  onChannelClicked?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, channelID: string) => void
}

export interface IChannelUpdateProps {
  channelID: string,
  channelName?: string,
  channelIcon?: boolean,
  members?: string[],
}

export interface IChannelMemberProps {
  userID: string;
  username: string;
  avatar: string;
}

export interface IChannelMemberListProps {
  channel: Channel | undefined;
}
