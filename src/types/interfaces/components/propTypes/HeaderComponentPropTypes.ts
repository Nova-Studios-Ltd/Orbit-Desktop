export interface IHeaderProps {
  className?: string,
  style?: React.CSSProperties,
  caption?: string,
  icon?: JSX.Element,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void,
  children?: JSX.Element | JSX.Element[]
}
