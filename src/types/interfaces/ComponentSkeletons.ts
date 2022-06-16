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
