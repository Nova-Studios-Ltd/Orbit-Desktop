export interface IAuthPageProps {
  login?: boolean,
  register?: boolean,
  onNavigationDrawerOpened: (event: React.MouseEvent<HTMLButtonElement>, open?: boolean) => void
}
