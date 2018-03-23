import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import {
  Container,
  ButtonGroup,
  Button,
  Form,
  InputGroup,
  InputGroupButton,
  Input
} from 'reactstrap';
import { Link } from 'react-router-dom';
import intersectionBy from 'lodash/intersectionBy';

import { ALL_CLIENTS_QUERY } from '../../graphql/queries/client'
import { ALL_INVOICES_QUERY } from '../../graphql/queries/invoice';
import { DELETE_CLIENT_MUTATION } from '../../graphql/mutations/client';

class ClientList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasMoreItems: true,
      loading: false,
      clients: [],
      searchText: ''
    }
  }

  componentWillReceiveProps(newProps) {
    const { allClients, loading } = newProps.data;

    if (!loading) {
      const clients = intersectionBy(allClients, this.state.clients, 'id');
      this.setState({ clients });
    }
  }

  fetchMoreItems = (clients) => (e) => {
    const { allClients, fetchMore } = this.props.data;
    const { searchText } = this.state;

    const variables = {
      cursor: allClients[allClients.length - 1].createdAt
    };

    if (searchText) {
      [variables.searchText] = searchText
    }

    fetchMore({
      variables,
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }

        if (fetchMoreResult.allClients.length < 10) {
          this.setState({ hasMoreItems: false })
        }

        if (clients.length > 0) {
          this.setState({ clients: [...clients, ...fetchMoreResult.allClients] })
        }

        return {
          ...previousResult,
          allClients: [...previousResult.allClients, ...fetchMoreResult.allClients]
        }
      }
    })
  }

  executeSearch = async (e) => {
    e.preventDefault();

    const { searchText } = this.state;

    const result = await this.props.data.refetch({
      searchText,
      fetchPolicy: 'network-only'
    });

    this.setState({
      clients: result.data.allClients,
      hasMoreItems: result.data.allClients.length >= 2 ? true : false
    });
  }

  deleteClient = (id) => async (e) => {
    await this.props.mutate({
      variables: { id },
      update: (store, { data: { deleteClient } }) => {
        const { ok } = deleteClient;

        if (!ok) { return }

        const data = store.readQuery({
          query: ALL_CLIENTS_QUERY,
          variables: { cursor: null, searchText: null }
        });

        const idx = data.allClients.findIndex(client => client.id === id);

        data.allClients.splice(idx, 1);

        store.writeQuery({
          query: ALL_CLIENTS_QUERY,
          variables: { cursor: null, searchText: null },
          data
        });
      },
      refetchQueries: [{
        query: ALL_INVOICES_QUERY,
        variables: { cursor: null, filter: null }
      }]
    });
  }

  render() {
    let { allClients, loading } = this.props.data;
    const { hasMoreItems, clients } = this.state;

    if (clients.length > 0) {
      allClients = clients;
    }

    return (
      <section>
        <div className="title">
          <h2>Manage your list of clients</h2>
        </div>
        <Container>
          <Form onSubmit={this.executeSearch}>
            <InputGroup>
              <InputGroupButton>
                <Button color="success" type="submit">Search</Button>
              </InputGroupButton>
              <Input
                onChange={(e) => this.setState({ searchText: e.target.value })}
                placeholder="Search by social or comercial name"
              />
            </InputGroup>
          </Form>
          {loading ?
            <div className="text-center mt-4">
              <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
            </div>
          : <div className="mt-3">
              {allClients.map(client =>
                <div key={`client-${client.id}`} className="client-content">
                  {client.totalOilSum !== 0 &&
                    <h3 className="float-right text-secondary">
                      <i className="fa fa-truck text-success" aria-hidden="true"></i> {client.totalOilSum} L.
                    </h3>
                  }
                  <Link to={`/clients/${client.id}`}>
                    <h1 className="mb-1">
                      {client.socialName}
                      <small className="text-muted ml-3">{client.comercialName}</small>
                    </h1>
                  </Link>
                  <p className="mb-0">{client.emails[0].address}</p>
                  <p className="mt-1">
                    Invoices - <span className="badge badge-success">{client.invoiceCount}</span>
                  </p>
                  <ButtonGroup>
                    <Link
                      className="btn btn-outline-success"
                      to={{
                        pathname: `/clients/${client.id}/edit`,
                        state: { modal: true }
                      }}>
                      Update client information
                    </Link>
                    <Link
                      className="btn btn-outline-secondary"
                      to={{
                        pathname: `/clients/${client.id}/invoices/new`,
                        state: { modal: true }
                      }}>
                      Generate new invoice
                    </Link>
                    <Button
                      outline
                      color="danger"
                      onClick={this.deleteClient(client.id)}>
                      Delete
                    </Button>
                  </ButtonGroup>
                </div>
              )}
              { hasMoreItems && allClients.length >= 10 &&
                <Button
                  className="mx-auto d-block mt-4 mb-3"
                  onClick={this.fetchMoreItems(clients)}
                  outline
                  color="success">
                  Load more results
                </Button>
              }
            </div>
          }
        </Container>
      </section>
    );
  }
}

export default compose(
  graphql(DELETE_CLIENT_MUTATION),
  graphql(ALL_CLIENTS_QUERY)
)(ClientList);
