import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import moment from 'moment';
import { Container, ButtonGroup, Button } from 'reactstrap';
import { Link } from 'react-router-dom';

import { GET_CLIENT_QUERY } from '../../graphql/queries/client';

import InvoiceList from '../invoices/InvoiceList';

class ClientShow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: false
    };
  }

  toggle = () => {
    this.setState({ modal: !this.state.modal });
  }

  render() {
    const { loading, getClient: client } = this.props.data;

    return (
      <div>
        {loading ?
          <div className="text-center mt-4">
            <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
          </div>
        : <div>
            <div className="title">
              <h2>
                {client.socialName}
                <small className="text-muted ml-3">{client.comercialName}</small>
              </h2>
            </div>
            <Container>
              <ButtonGroup className="mt-2">
                <Link
                  className="btn btn-outline-secondary"
                  to="/">
                  Show client list
                </Link>
                <Link
                  className="btn btn-outline-success"
                  to={{
                    pathname: `/clients/${client.id}/edit`,
                    state: { modal: true }
                  }}>
                  Update client information
                </Link>
              </ButtonGroup>
              <hr />
              <div className="row">
                <div className="col-md-4">
                  <h2 className="text-muted">Client information</h2>
                  {client.rfc &&
                    [
                      <h4 key="1" className="mb-1 mt-2">RFC</h4>,
                      <span key="2">{client.rfc}</span>
                    ]
                  }
                  {client.legalRepresentative &&
                    [
                      <h4 key="1" className="mb-1 mt-2">Representative</h4>,
                      <span key="2">{client.legalRepresentative}</span>
                    ]
                  }
                  {client.responsible &&
                    [
                      <h4 key="1" className="mb-1 mt-2">Responsible</h4>,
                      <span key="2">{client.responsible}</span>
                    ]
                  }
                  {client.phone &&
                    [
                      <h4 key="1" className="mb-1 mt-2">Phone</h4>,
                      <span key="2">{client.phone}</span>
                    ]
                  }
                </div>
                <div className="col-md-4">
                  <h2 className="text-muted">Contract information</h2>
                  {client.contract.oilPayment >= 0 &&
                    [
                      <h4 key="1" className="mb-1 mt-2">Oil Payment</h4>,
                      <span key="2">{client.contract.oilPayment} L.</span>
                    ]
                  }
                  {client.contract.contractDate &&
                    [
                      <h4 key="1" className="mb-1 mt-2">Contract Date</h4>,
                      <span key="2">
                        {moment(new Date(client.contract.contractDate)).format('MMMM Do YYYY')}
                      </span>
                    ]
                  }
                  {client.contract.contractEnd &&
                    [
                      <h4 key="1" className="mb-1 mt-2">Contract End</h4>,
                      <span key="2">
                        {moment(new Date(client.contract.contractEnd)).format('MMMM Do YYYY')}
                      </span>
                    ]
                  }
                  {client.contract.address &&
                    [
                      <h4 key="1" className="mb-1 mt-2">Address</h4>,
                      <span key="2">{client.contract.address}</span>
                    ]
                  }
                </div>
                <div className="col-md-4">
                  <h2 className="text-muted">Email addresses</h2>
                  <ul className="list-unstyled">
                    {client.emails.map((email, key) =>
                      <li key={key}>{email.address}</li>
                    )}
                  </ul>
                  <h2 className="text-muted">Attachments</h2>
                  <ul className="list-unstyled">
                    {client.files.map((file, key) =>
                      <li key={key}>
                        <a
                          target="_blank"
                          href={`${process.env.REACT_APP_SERVER_URL}/${file.path}`}
                          key={key}>
                          {file.name}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              <hr />
              {client.totalOilSum >= 0 &&
                <h3 className="text-secondary mb-3">
                  <i className="fa fa-truck text-success" aria-hidden="true"></i> {client.totalOilSum} L.
                </h3>
              }
              <Button
                outline
                color="secondary"
                onClick={this.toggle}>
                Show client invoices
              </Button>
              <InvoiceList isOpen={this.state.modal} toggle={this.toggle} />
            </Container>
          </div>
        }
      </div>
    );
  }
}

export default graphql(GET_CLIENT_QUERY, {
  options: props => ({
    variables: {
      id: props.match.params.id
    }
  })
})(ClientShow);
