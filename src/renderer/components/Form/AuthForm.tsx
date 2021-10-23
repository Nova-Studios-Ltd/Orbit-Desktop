import React, { FormEventHandler, ReactChildren } from 'react';
import { IAuthFormProps } from 'renderer/interfaces';
import FormStatusField from './FormStatusField';
import FormHeader from './FormHeader';
import FormStatusTuple, { FormStatusType } from './FormStatusTypes';

export default class AuthForm extends React.Component {
  headerHeading?: string;
  headerBody?: string;
  handleSubmit?: FormEventHandler<HTMLFormElement>;
  children?: JSX.Element|JSX.Element[];;
  props: IAuthFormProps;

  constructor(props: IAuthFormProps) {
    super(props);
    this.props = props;
    this.handleSubmit = props.onSubmit;

    this.headerHeading = props.headerHeading || "";
    this.headerBody = props.headerBody || "";
    this.children = props.children;

    if (this.handleSubmit != null)
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {

    const { message, type } = this.props.status != null ? this.props.status : new FormStatusTuple(undefined, undefined);

    return(
      <form className="AuthForm_Container" onSubmit={this.handleSubmit}>
        <FormHeader heading={this.headerHeading} body={this.headerBody} />
        <FormStatusField message={message} type={type} />
        {this.children}
      </form>
    );
  }
}
