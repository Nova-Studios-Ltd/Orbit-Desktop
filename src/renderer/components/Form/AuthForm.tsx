import React, { FormEventHandler, ReactChildren } from 'react';
import { AuthFormProps } from 'renderer/interfaces';
import FormStatusField from './FormStatusField';
import FormHeader from './FormHeader';
import { FormStatusType } from './FormStatusTypes';

export default class AuthForm extends React.Component {
  headerHeading?: string;
  headerBody?: string;
  statusMessage?: string;
  statusType?: FormStatusType;
  handleSubmit?: FormEventHandler<HTMLFormElement>;
  children?: JSX.Element|JSX.Element[];;
  props: AuthFormProps;

  constructor(props: AuthFormProps) {
    super(props);
    this.props = props;
    this.handleSubmit = props.onSubmit;

    this.headerHeading = props.headerHeading || "";
    this.headerBody = props.headerBody || "";
    if (props.status != null) {
      this.statusMessage = props.status.message || "";
      this.statusType = props.status.type || FormStatusType.default;
    }
    else {
      this.statusMessage = "";
      this.statusType = FormStatusType.default;
    }
    this.children = props.children;

    if (this.handleSubmit != null)
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return(
      <form className="AuthForm_Container" onSubmit={this.handleSubmit}>
        <FormHeader heading={this.headerHeading} body={this.headerBody} />
        <FormStatusField message={this.statusMessage} type={this.statusType} />
        {this.children}
      </form>
    );
  }
}
