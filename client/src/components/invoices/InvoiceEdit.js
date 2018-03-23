import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import yup from 'yup';
import moment from 'moment';

import InvoiceForm from './InvoiceForm';
import formatErrors from '../../helpers/errors';

import { GET_INVOICE_QUERY } from '../../graphql/queries/invoice';
import { UPDATE_INVOICE_MUTATION } from '../../graphql/mutations/invoice';

class InvoiceEdit extends Component {
  constructor(props) {
    super(props);

    this.state = this.getInitialState();

    this.invoiceSchema = yup.object().shape({
      code: yup
        .string()
        .required('this field is required'),
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
    const { data: { getInvoice: invoice } } = newProps;

    if (!newProps.data.loading) {
      this.setState({
        code: invoice.code,
        city: invoice.city,
        receiver: invoice.receiver,
        notes: invoice.notes,
        invoiceDate: moment(new Date(invoice.invoiceDate)),
        total: invoice.total
      });
    }
  }

  onChange = (field, value) => {
    this.setState({ [field]: value });
  }

  onSubmit = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    const payload = {
      id: this.props.match.params.invoiceId,
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

    const resp = await this.props.updateInvoice({
      variables: payload
    });

    const { ok, errors } = resp.data.updateInvoice;

    if (ok) {
      this.setState(this.getInitialState());
      this.props.history.push(`/clients/${this.props.match.params.id}`);
    } else {
      this.setState({
        errors: formatErrors(errors),
        loading: false
      });
    }
  }

  onModalClose = (e) => {
    this.props.history.goBack();
  }

  render() {
    const { onModalClose } = this.props;
    const { ...invoice } = this.state;

    return (
      <InvoiceForm
        action="edit"
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
  graphql(GET_INVOICE_QUERY, {
    options: props => ({
      variables: {
        id: props.match.params.invoiceId
      }
    })
  }),
  graphql(UPDATE_INVOICE_MUTATION, { name: 'updateInvoice' })
)(InvoiceEdit);
