import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import moment from 'moment';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from 'reactstrap';

import { GET_INVOICE_QUERY } from '../../graphql/queries/invoice';

class InvoiceShow extends Component {
  onModalClose = (e) => {
    this.props.history.goBack();
  }

  render() {
    const { onModalClose, data: { loading, getInvoice: invoice } } = this.props;

    const parseDate = (date) => {
      return moment(new Date(date)).format('MMMM Do YYYY');
    }

    return (
      <Modal
        isOpen={true}
        toggle={onModalClose || this.onModalClose}
        className={this.props.className}>
        <ModalHeader toggle={onModalClose || this.onModalClose}>
          Invoice information {invoice ? invoice.code : ''}
        </ModalHeader>
        <ModalBody>
          {loading ?
            <div className="text-center mt-4">
              <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
            </div>
          : <div>
              <h1>{invoice.code} - <small className="text-muted">{invoice.city}</small></h1>
              <p className="mb-2">{invoice.notes}</p>
              <h2>Total {invoice.total} L.</h2>
              <p className="mb-2">Received by {invoice.receiver} on {parseDate(invoice.invoiceDate)}</p>
            </div>
          }
        </ModalBody>
        <ModalFooter>
          <Button outline color="secondary" onClick={onModalClose || this.onModalClose}>Cancel</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default graphql(GET_INVOICE_QUERY, {
  options: props => ({
    variables: {
      id: props.match.params.id
    }
  })
})(InvoiceShow)
