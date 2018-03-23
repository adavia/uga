import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import yup from 'yup';
import moment from 'moment';

import ClientForm from './ClientForm';
import formatErrors from '../../helpers/errors';

import { ALL_CLIENTS_QUERY } from '../../graphql/queries/client';
import { CREATE_CLIENT_MUTATION } from '../../graphql/mutations/client';

class ClientNew extends Component {
  constructor(props) {
    super(props);

    this.state = this.getInitialState();

    this.clientSchema = yup.object().shape({
      socialName: yup
        .string()
        .required('this field is required'),
      comercialName: yup
        .string()
        .required('this field is required'),
      oilPayment: yup
        .number()
        .typeError('Payment must be a number')
        .required('this field is required')
        .min(0)
        .positive('Payment should be a positive value'),
      emails: yup.array().of(yup.object().shape({
        address: yup
          .string()
          .required('address is a required field')
          .email('must be a valid email address')
      }))
    });
  }

  getInitialState = () => {
    return {
      rfc: '',
      socialName: '',
      legalRepresentative: '',
      comercialName: '',
      responsible: '',
      phone: '',
      oilPayment: 0,
      contractDate: moment(),
      contractEnd: moment(),
      contact: '',
      address: '',
      emails: [],
      files: [],
      loading: false,
      errors: {},
      filesModal: false
    }
  }

  toggleFilesModal = () => {
    this.setState({
      filesModal: !this.state.filesModal,
      closeAllModals: false
    });
  }

  onChange = (field, value) => {
    this.setState({ [field]: value });
  }

  emailAddressChange = (i) => (e) => {
    const emails = this.state.emails.map((email, idx) => {
      if (idx !== i) return email;
      return { ...email, address: e.target.value };
    });

    this.setState({ emails: emails });
  }

  addEmailAddress = () => {
    this.setState({
      emails: [...this.state.emails, { address: '' }]
    });
  }

  removeEmailAddress = (i) => () => {
    const emails = this.state.emails.filter((e, index) => {
      return index !== i;
    });

    this.setState({ emails: emails });
  }

  droppedFiles = (files, rejected) => {
    if (this.state.errors.files) {
      this.setState({ errors: {} });
    }

    if (rejected.length > 0) {
      this.setState({
        errors: {
          files: ['Some filetypes are not allowed. Please select only pdf/word/excel files']
        }
      });
    }

    this.setState({ files: files });
  }

  clearFilesModal = () => {
    this.setState({ files: [] });
  }

  onSubmit = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    const payload = {
      rfc: this.state.rfc,
      socialName: this.state.socialName,
      legalRepresentative: this.state.legalRepresentative,
      comercialName: this.state.comercialName,
      responsible: this.state.responsible,
      phone: this.state.phone,
      contract: {
        oilPayment: this.state.oilPayment,
        contractDate: this.state.contractDate,
        contractEnd: this.state.contractEnd,
        contact: this.state.contact,
        address: this.state.address
      },
      emails: this.state.emails,
      files: this.state.files
    }

    try {
      await this.clientSchema.validate({
        socialName: payload.socialName,
        comercialName: payload.comercialName,
        emails: payload.emails,
        oilPayment: payload.contract.oilPayment
      }, { abortEarly: false });
    } catch (e) {
      return this.setState({
        errors: formatErrors(e.inner),
        loading: false
      })
    }

    const resp = await this.props.mutate({
      variables: payload,
      update: (store, { data: { createClient } }) => {
        const { ok, client } = createClient;

        if (!ok) { return }

        const data = store.readQuery({
          query: ALL_CLIENTS_QUERY,
          variables: { cursor: null, searchText: null }
        });

        data.allClients.push(client);

        store.writeQuery({
          query: ALL_CLIENTS_QUERY,
          variables: { cursor: null, searchText: null },
          data
        });
      }
    });

    const { ok, errors } = resp.data.createClient;

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
    const { ...client } = this.state;

    return (
      <ClientForm
        action="new"
        client={client}
        onModalClose={onModalClose || this.onModalClose}
        addEmailAddress={this.addEmailAddress}
        emailAddressChange={this.emailAddressChange}
        removeEmailAddress={this.removeEmailAddress}
        toggleFilesModal={this.toggleFilesModal}
        clearFilesModal={this.clearFilesModal}
        droppedFiles={this.droppedFiles}
        onChange={this.onChange}
        onChangeDate={this.onChangeDate}
        onSubmit={this.onSubmit}
      />
    );
  }
}

export default compose(
  graphql(CREATE_CLIENT_MUTATION)
)(ClientNew);
