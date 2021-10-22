import React, { FormEventHandler, ReactChildren } from 'react';
import { AuthFormProps } from 'renderer/interfaces';
import FormStatusField from './FormStatusField';
import FormHeader from './FormHeader';
import FormStatusTuple, { FormStatusType } from './FormStatusTypes';

export default class AuthForm extends React.Component {
  headerHeading: string;
  headerBody: string;
  handleSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactChildren;

  constructor(props: AuthFormProps) {
    super(props);
    this.handleSubmit = props.onSubmit;
    this.headerHeading = props.headerHeading;
    this.headerBody = props.headerBody;
    this.children = props.children;

    this.state = { status: props.status as FormStatusTuple };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {
    status: null as unknown as FormStatusTuple
  }

  updateStatus(message: string, type: FormStatusType) {
    this.setState({ status: new FormStatusTuple(message, type) });
  }

  render() {
    return(
      <form className="AuthForm_Container" onSubmit={this.handleSubmit}>
        <FormHeader heading={this.headerHeading} body={this.headerBody} />
        <FormStatusField message={this.state.status != null ? this.state.status.message : ""} type={this.state.status != null ? this.state.status.type : FormStatusType.default} />
        {this.children}
      </form>
    );
  }
}
