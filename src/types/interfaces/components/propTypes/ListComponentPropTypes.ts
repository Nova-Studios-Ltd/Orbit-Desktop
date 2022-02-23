export interface IHybridListItemProps {
  className?: string,
  id?: string,
  text?: string,
  icon?: JSX.Element,
  selected?: boolean,
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void,
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void
}
