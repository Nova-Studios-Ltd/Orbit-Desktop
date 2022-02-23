import type { Dimensions } from "types/types";

export interface IGenericDialogProps {
  title: string,
  children: JSX.Element | JSX.Element[],
  actions: JSX.Element | JSX.Element[]
}

export interface IImageViewerProps {
  src: string,
  dimensions: Dimensions,
  open: boolean,
  onDismiss: () => void
}

export interface IYesNoDialogProps {
  title: string,
  body: string,
  show: boolean,
  confirmButtonText?: string,
  denyButtonText?: string,
  onConfirm?: React.MouseEventHandler<HTMLAnchorElement>,
  onDeny?: React.MouseEventHandler<HTMLAnchorElement>,
}
