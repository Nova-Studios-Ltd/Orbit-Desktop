import React from 'react';
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select} from '@mui/material';
import { IFormDropdownProps } from 'types/interfaces';

export default class FormDropdown extends React.Component {
  props: IFormDropdownProps;
  id: string;
  label: string;
  description?: string;

  constructor(props: IFormDropdownProps) {
    super(props);
    this.id = props.id || Math.random().toString();
    this.label = props.label || 'Label';
    this.description = props.description;
  }

  render() {
    return(
      <Box className='Generic_Form_Item'>
        <FormControl fullWidth id={this.id}>
          <InputLabel id={`${this.id}-label`}>{this.label}</InputLabel>
          <Select
            label={this.label}
            labelId={`${this.id}-label`}
            onChange={this.props.onChange}
            value={this.props.value}
          >
            {this.props.children}
          </Select>
          <FormHelperText>{this.description}</FormHelperText>
        </FormControl>
      </Box>
    );
  }
}
