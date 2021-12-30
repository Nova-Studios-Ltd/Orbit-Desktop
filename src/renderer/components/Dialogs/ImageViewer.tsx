import React from 'react';
import { Typography } from '@mui/material';
import type { Dimensions } from 'types/types';

interface IImageViewerProps {
  src: string,
  dimensions: Dimensions,
  open: boolean,
  onDismiss: () => void
}

export default class ImageViewer extends React.Component<IImageViewerProps> {
  render() {
    const ImageViewerElement = () => {
      if (this.props.open) {

        const vw = Math.floor(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) * 0.7);
        const vh = Math.floor(Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) * 0.7);
        
        let finalWidth = this.props.dimensions.width;
        let finalHeight = this.props.dimensions.height;

        if (this.props.dimensions.width > 0 && this.props.dimensions.height > 0) {
          const xRatio = this.props.dimensions.width / vw;
          const yRatio = this.props.dimensions.height / vh;
          const ratio = Math.max(xRatio, yRatio);
          const nnx = Math.floor(this.props.dimensions.width / ratio);
          const nny = Math.floor(this.props.dimensions.height / ratio);
    
          finalWidth = nnx;
          finalHeight = nny;
        }

        const styles = {
          width: finalWidth > 0 ? finalWidth: '18rem',
          height: finalHeight > 0 ? finalHeight: '30rem',
        }
        return (
          <div className='ImageViewer_Container' tabIndex={0} role='button' onClick={this.props.onDismiss} onKeyDown={this.props.onDismiss}>
            <img className='ImageViewer_Media' style={styles} src={this.props.src} alt='Expanded View' />
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
