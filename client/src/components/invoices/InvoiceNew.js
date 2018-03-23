import React, { Component } from 'react';
//import { withApollo } from 'react-apollo';
import { compose, graphql } from 'react-apollo';
import yup from 'yup';
import moment from 'moment';

import InvoiceForm from './InvoiceForm';
import formatErrors from '../../helpers/errors';

import { ALL_INVOICES_QUERY } from '../../graphql/queries/invoice';
import { GET_CLIENT_QUERY } from '../../graphql/queries/client';
import { CREATE_INVOICE_MUTATION, UNIQUE_INVOICE_CODE_MUTATION } from '../../graphql/mutations/invoice';

class InvoiceNew extends Component {
  constructor(props) {
    super(props);

    this.state = this.getInitialState();

    this.invoiceSchema = yup.object().shape({
      code: yup
        .string()
        .required('this field is required')
        .test('uniqueCode', 'has already been taken!', async (value) => {
          if (value) {
            const resp = await this.props.uniqueInvoiceCode({
              variables: {
                code: value
              }
            });

            return resp.data.uniqueCode;
          }
        }),
      total: yup
        .number()
        .typeError('Total must be a number')
        .required('this field is required')
        .min(0)
        .positive('Total should be a positive value')
    });
  }

  getInitialState = () => {
    return {
      code: '',
      city: '',
      receiver: '',
      notes: '',
      invoiceDate: moment(),
      total: 0,
      loading: false,
      errors: {}
    }
  }

  componentWillReceiveProps(newProps) {
    const { data: { loading, getClient: client } } = newProps;

    if (!loading) {
      this.setState({ city: client.contract.address });
    }
  }

  onChange = (field, value) => {
    this.setState({ [field]: value });
  }

  onSubmit = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    const payload = {
      code: this.state.code,
      city: this.state.city,
      receiver: this.state.receiver,
      notes: this.state.notes,
      invoiceDate: this.state.invoiceDate,
      total: this.state.total,
      clientId: parseInt(this.props.match.params.id, 10)
    }

    try {
      await this.invoiceSchema.validate({
        total: payload.total,
        code: payload.code
      }, { abortEarly: false });
    } catch (e) {
      return this.setState({
        errors: formatErrors(e.inner),
        loading: false
      })
    }

    const resp = await this.props.createInvoice({
      variables: payload,
      refetchQueries: [{
        query: ALL_INVOICES_QUERY,
        variables: { cursor: null, filter: null }
      }]
    });

    const { ok, errors } = resp.data.createInvoice;

    if (ok) {
      this.setState(this.getInitialState());
      this.props.history.push('/');
    } else {
      this.setState({
        errors: formatErrors(errors),
        loading: false
      });
    }
  }

  onModalClose = (e) => {
    this.props.history.goBack();
  };

  render() {
    const { onModalClose } = this.props;
    const { ...invoice } = this.state;
    
    return (
      <InvoiceForm
        action="new"
        invoice={invoice}
        onModalClose={onModalClose || this.onModalClose}
        onChange={this.onChange}
        onChangeDate={this.onChangeDate}
        onSubmit={this.onSubmit}
      />
    );
  }
}

export default compose(
  graphql(GET_CLIENT_QUERY, {
    options: props => ({
      variables: {
        id: props.match.params.id
      }
    })
  }),
  graphql(CREATE_INVOICE_MUTATION, { name: 'createInvoice' }),
  graphql(UNIQUE_INVOICE_CODE_MUTATION, { name: 'uniqueInvoiceCode' })
)(InvoiceNew);
