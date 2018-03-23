import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import yup from 'yup';
import moment from 'moment';

import ClientForm from './ClientForm';
import formatErrors from '../../helpers/errors';

import { GET_CLIENT_QUERY } from '../../graphql/queries/client';
import { UPDATE_CLIENT_MUTATION } from '../../graphql/mutations/client';

class ClientEdit extends Component {
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
      deletedEmails: [],
      files: [],
      loading: false,
      errors: {},
      filesModal: false
    }
  }

  componentWillReceiveProps(newProps) {
    const { data: { loading, getClient: client } } = newProps;

    if (!loading) {
      this.setState({
        rfc: client.rfc,
        socialName: client.socialName,
        legalRepresentative: client.legalRepresentative,
        comercialName: client.comercialName,
        responsible: client.responsible,
        phone: client.phone,
        oilPayment: client.contract.oilPayment,
        contractDate: moment(new Date(client.contract.contractDate)),
        contractEnd: moment(new Date(client.contract.contractEnd)),
        contact: client.contract.contact,
        address: client.contract.address,
        emails: client.emails.map(email => {
          return {
            id: email.id,
            address: email.address
          }
        }),
        files: client.files.map(file => {
          return {
            id: file.id,
            name: file.name,
            path: file.path,
            type: file.type
          }
        })
      });
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
    const { emails } = this.state;

    if (emails[i].id) {
      this.setState({
        deletedEmails: [...this.state.deletedEmails, emails[i]]
      });
    }

    const deleted = this.state.emails.filter((e, index) => {
      return index !== i;
    });

    this.setState({ emails: deleted });
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

    this.setState({ files: [...this.state.files, ...files] });
  }

  clearFilesModal = () => {
    this.setState({ files: [] });
  }

  onSubmit = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    const payload = {
      id: this.props.match.params.id,
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
      deletedEmails: this.state.deletedEmails,
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
      });
    }

    const resp = await this.props.mutate({
      variables: payload
    });

    const { ok, errors } = resp.data.updateClient;

    if (ok) {
      this.setState(this.getInitialState());
      //url `/clients/${this.props.match.params.id}`
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
  };

  render() {
    const { onModalClose } = this.props;
    const { ...client } = this.state;

    return (
      <ClientForm
        action="edit"
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
  graphql(GET_CLIENT_QUERY, {
    options: props => ({
      variables: {
        id: props.match.params.id
      }
    })
  }),
  graphql(UPDATE_CLIENT_MUTATION)
)(ClientEdit);
