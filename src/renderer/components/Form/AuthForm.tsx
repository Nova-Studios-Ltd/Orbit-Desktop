import React, { FormEventHandler } from 'react';
import FormStatusTuple from 'structs/FormStatusTypes';
import FormStatusField from './FormStatusField';
import FormHeader from './FormHeader';

interface IAuthFormProps {
  headerHeading?: string,
  headerBody?: string,
  status?: FormStatusTuple,
  onSubmit?: FormEventHandler<HTMLFormElement>,
  children?: JSX.Element|JSX.Element[]
}

export default class AuthForm extends React.Component<IAuthFormProps> {
  headerHeading?: string;
  headerBody?: string;
  handleSubmit?: FormEventHandler<HTMLFormElement>;
  children?: JSX.Element|JSX.Element[];

  constructor(props: IAuthFormProps) {
    super(props);
    this.handleSubmit = props.onSubmit;

    this.headerHeading = props.headerHeading || '';
    this.headerBody = props.headerBody || '';
    this.children = props.children;

    if (this.handleSubmit != null)
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    const { message, type } = this.props.status != null ? this.props.status : new FormStatusTuple(undefined, undefined);
    return(
      <form className='FormContainer AuthForm_Container' onSubmit={this.handleSubmit}>
        <FormHeader heading={this.headerHeading} body={this.headerBody} />
        <FormStatusField message={message} type={type} />
        {this.children}
      </form>
    );
  }
}
