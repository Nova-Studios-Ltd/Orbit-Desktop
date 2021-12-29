import React from 'react';
import { Card } from '@mui/material';
import type { Dimensions } from 'types/types';

interface IImageViewerProps {
  imageSrc: string,
  dimensions: Dimensions
}

export default class ImageViewerProps extends React.Component<IImageViewerProps> {
  render() {
    return(
      <Card>

      </Card>
    );
  }
}
