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
import { Link, withRouter } from 'react-router-dom';

import { CLIENT_INVOICES_QUERY } from '../../graphql/queries/invoice';

class InvoiceList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasMoreItems: true
    }
  }

  fetchMoreItems = () => {
    const { clientInvoices, fetchMore } = this.props.data;

    const variables = {
      cursor: clientInvoices[clientInvoices.length - 1].createdAt
    };

    fetchMore({
      variables,
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }

        if (fetchMoreResult.clientInvoices.length < 10) {
          this.setState({ hasMoreItems: false })
        }

        return {
          ...previousResult,
          clientInvoices: [...previousResult.clientInvoices, ...fetchMoreResult.clientInvoices]
        }
      }
    })
  }

  render() {
    const { toggle, isOpen } = this.props;
    const { loading, clientInvoices: invoices } = this.props.data;
    const { hasMoreItems } = this.state;

    const parseDate = (date) => {
      return moment(new Date(date)).format('MMMM Do YYYY');
    }

    return (
      <Modal
        size="lg"
        isOpen={isOpen}
        toggle={toggle}
        className={this.props.className}>
        <ModalHeader toggle={toggle}>Invoices</ModalHeader>
        <ModalBody>
          {loading ?
            <div className="text-center mt-4">
              <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
            </div>
          : <div className="invoice-list">
              {invoices.map(invoice =>
                <div key={invoice.id} className="invoice-item">
                  <Link
                    to={{
                      pathname: `/clients/${invoice.clientId}/invoices/${invoice.id}/edit`,
                      state: { modal: true }
                    }}>
                    <h3 className="mb-0">
                      {invoice.code}
                      <small className="text-muted ml-3">
                        {parseDate(invoice.invoiceDate)} received by {invoice.receiver} - {invoice.city}
                      </small>
                    </h3>
                  </Link>
                  <small>
                    Total: <strong>{invoice.total} L.</strong>
                  </small>
                  <p className="mt-1">{invoice.notes}</p>
                </div>
              )}
              { hasMoreItems && invoices.length >= 10 &&
                <Button
                  className="mx-auto d-block mt-4 mb-3"
                  onClick={this.fetchMoreItems}
                  outline
                  color="success">
                  Load more results
                </Button>
              }
            </div>
          }
        </ModalBody>
        <ModalFooter>
          <Button outline color="success" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
    );
  }
}


export default withRouter(
  graphql(CLIENT_INVOICES_QUERY, {
    options: props => ({
      variables: {
        clientId: props.match.params.id
      },
      fetchPolicy: 'network-only'
    })
  })(InvoiceList)
)
