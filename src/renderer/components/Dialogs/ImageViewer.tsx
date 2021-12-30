import React from 'react';
import { Typography } from '@mui/material';
import type { Dimensions } from 'types/types';

interface IImageViewerProps {
  src: string,
  dimensions: Dimensions,
  open: boolean,
  onDismiss: () => void
}

interface IImageViewerState {
  desiredDimensions: Dimensions;
  finalDimensions: Dimensions;
}

export default class ImageViewer extends React.Component<IImageViewerProps> {
  state: IImageViewerState;

  constructor(props: IImageViewerProps) {
    super(props);

    this.state = {
      desiredDimensions: { width: 0, height: 0 },
      finalDimensions: { width: 0, height: 0 }
    }
  }

  componentDidMount() {
    this.setState({ desiredDimensions: { width: this.props.dimensions.width * 2, height: this.props.dimensions.height * 2 } }, () => {
      if (this.props.dimensions.width > 0 && this.props.dimensions.height > 0) {
        const xRatio = this.props.dimensions.width / this.state.desiredDimensions.width;
        const yRatio = this.props.dimensions.height / this.state.desiredDimensions.height;
        const ratio = Math.max(xRatio, yRatio);
        let nnx = Math.floor(this.props.dimensions.width / ratio);
        let nny = Math.floor(this.props.dimensions.height / ratio);

        if (this.props.dimensions.width < this.state.desiredDimensions.width && this.props.dimensions.height < this.state.desiredDimensions.height) {
          nnx = this.props.dimensions.width;
          nny = this.props.dimensions.height;
        }

        this.setState({ finalDimensions: { width: nnx, height: nny } });
      }
      else {
        this.setState({ finalDimensions: this.props.dimensions });
      }
    });
  }

  render() {
    const ImageViewerElement = () => {
      if (this.props.open) {
        return (
          <div className='ImageViewer_Container' tabIndex={0} role='button' onClick={this.props.onDismiss} onKeyDown={this.props.onDismiss}>
            <img className='ImageViewer_Media' width={this.state.finalDimensions.width} height={this.state.finalDimensions.height} src={this.props.src} alt='Expanded View' />
            <Typography sx={{color: 'white', marginTop: 2}} variant='caption'>(click anywhere to close)</Typography>
          </div>
        );
      }

      return null;
    }

    return (
      <ImageViewerElement />
    );
  }
}
