import React from "react";
import { Chip, TextField } from "@mui/material";

import type { IChipTextFieldProps } from "types/interfaces/components/propTypes/FormComponentPropTypes"
import type { IChipTextFieldState } from "types/interfaces/components/states/FormComponentStates";

export default class ChipTextField extends React.Component<IChipTextFieldProps, IChipTextFieldState> {
  id: string;
  classNames: string;
  label: string;
  description?: string;
  autoFocus?: boolean;
  required?: boolean;
  sensitive?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  constructor(props: IChipTextFieldProps) {
    super(props);
    this.id = props.id || "";
    this.classNames = props.classNames || "";
    this.label = props.label || "";
    this.description = props.description || "";
    this.autoFocus = props.autoFocus || false;
    this.required = props.required || false;
    this.sensitive = props.sensitive || false;
    this.onChange = props.onChange || undefined;
  }

  render() {
    const fieldType = this.sensitive ? "password" : "text";
    let finalClassNames = "Generic_Form_Item Form_Text_Field";
    if (this.classNames.length > 0) {
      finalClassNames = finalClassNames.concat(" ", this.classNames);
    }

    return (
      <TextField
        className={finalClassNames}
        value={this.props.value}
        name={this.id}
        label={this.label}
        helperText={this.description}
        type={fieldType}
        required={this.required}
        variant="outlined"
        autoFocus={this.autoFocus}
        onChange={this.onChange}
        inputProps={{
          startAdornment: () => {
            if (this.state.selectedItem != null) {
              this.state.selectedItem.map(item => {
                <Chip />
              });
            }
          }
        }}
      />
    );
  }
}
