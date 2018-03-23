import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import moment from 'moment';
import {
  Container,
  Card,
  Button,
  CardHeader,
  CardFooter,
  CardBody,
  CardTitle,
  CardText,
  FormGroup,
  Input,
  Row,
  Col
} from 'reactstrap';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import Autocomplete from '../shared/Autocomplete';
import intersectionBy from 'lodash/intersectionBy';

import { ALL_INVOICES_QUERY } from '../../graphql/queries/invoice';
import { DELETE_INVOICE_MUTATION } from '../../graphql/mutations/invoice';
import { AUTOCOMPLETE_CLIENTS_QUERY } from '../../graphql/queries/client';

import InvoiceReport from './InvoiceReport';

class InvoiceSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: false,
      criteria: {
        code: '',
        city: '',
        client: undefined,
        responsible: '',
        invoiceDate: undefined
      },
      hasMoreItems: true,
      loading: false,
      invoices: []
    }
  }

  componentWillReceiveProps(newProps) {
    const { allInvoices, loading } = newProps;

    if (!loading) {
      const invoices = intersectionBy(allInvoices, this.state.invoices, 'id');
      this.setState({ invoices });
    }
  }

  toggleModal = () => {
    this.setState({
      modal: !this.state.modal
    });
  }

  fetchMoreItems = (invoices) => (e) => {
    const { allInvoices: { allInvoices, fetchMore } } = this.props;

    const { criteria } = this.state;

    const variables = {
      cursor: allInvoices[allInvoices.length - 1].createdAt,
      filter: criteria
    };

    fetchMore({
      variables,
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }

        if (fetchMoreResult.allInvoices.length < 10) {
          this.setState({ hasMoreItems: false })
        }

        if (invoices.length > 0) {
          this.setState({ invoices: [...invoices, ...fetchMoreResult.allInvoices] })
        }

        return {
          ...previousResult,
          allInvoices: [...previousResult.allInvoices, ...fetchMoreResult.allInvoices]
        }
      }
    })
  }

  executeSearch = async (e) => {
    e.preventDefault();

    const { criteria } = this.state;

    const result = await this.props.allInvoices.refetch({
      filter: criteria,
      fetchPolicy: 'network-only'
    });

    this.setState({
      invoices: result.data.allInvoices,
      hasMoreItems: result.data.allInvoices.length >= 2 ? true : false
    });
  }

  deleteInvoice = (id, clientId, total) => async (e) => {
    await this.props.deleteInvoice({
      variables: { id, clientId, total },
      update: (store, { data: { deleteInvoice } }) => {
        const { ok } = deleteInvoice;

        if (!ok) { return }

        const data = store.readQuery({
          query: ALL_INVOICES_QUERY,
          variables: { cursor: null, filter: null }
        });

        const idx = data.allInvoices.findIndex(invoice => invoice.id === id);

        data.allInvoices.splice(idx, 1);

        store.writeQuery({
          query: ALL_INVOICES_QUERY,
          variables: { cursor: null, filter: null },
          data
        });
      }
    });
  }

  renderSuggestion = (suggestion) => {
    return (
      <div>
        {suggestion.comercialName}
      </div>
    );
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.props.autocompleteClients.refetch({ searchText: value });
  }

  onSuggestionSelected = (event, { suggestion }) => {
    const { criteria } = this.state;

    this.setState({
      criteria: Object.assign(criteria, { client: suggestion.id })
    });
  }

  render() {
    let { allInvoices: { loading, allInvoices } } = this.props;
    const { criteria, invoices, modal, hasMoreItems } = this.state;

    if (invoices.length > 0) {
      allInvoices = invoices;
    }

    return (
      <section>
        <div className="title">
          <h2>Client invoice report</h2>
        </div>
        <Container>
          <h3>Advanced search criteria</h3>
          <Button onClick={this.toggleModal} outline color="success">Show graph results</Button>
          <InvoiceReport modal={modal} toggleModal={this.toggleModal} />
          <hr className="mb-0" />
          <Row>
            {loading ?
              <Col sm="7">
                <div className="text-center mt-4">
                  <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
                </div>
              </Col>
            : <Col sm="7">
                {allInvoices.map(invoice =>
                  <Card key={invoice.id} className="my-4">
                    <CardHeader>
                      INVOICE CODE - <strong>{invoice.code}</strong>
                    <span className="pull-right">
                      {moment(new Date(invoice.invoiceDate)).format('MMMM Do YYYY')}
                    </span>
                    </CardHeader>
                    <CardBody>
                      <CardTitle>{invoice.client.comercialName}</CardTitle>
                      <CardText>{invoice.notes}</CardText>
                      <Link
                        className="btn btn-secondary btn-sm"
                        to={{
                          pathname: `/invoices/${invoice.id}`,
                          state: { modal: true }
                        }}>
                        Show invoice
                      </Link>
                      <Link
                        className="btn btn-success ml-2 btn-sm"
                        to={{
                          pathname: `/clients/${invoice.clientId}/invoices/${invoice.id}/edit`,
                          state: { modal: true }
                        }}>
                        Update invoice
                      </Link>
                      <Button
                        color="danger"
                        className="ml-2 btn-sm"
                        onClick={this.deleteInvoice(invoice.id, invoice.clientId, invoice.total)}>
                        Delete
                      </Button>
                    </CardBody>
                    <CardFooter>
                      Total Oil: {invoice.total} litters
                      <span className="pull-right">
                        Responsible {invoice.client.responsible}
                      </span>
                    </CardFooter>
                  </Card>
                )}
                { hasMoreItems && allInvoices.length >= 10 &&
                  <Button
                    className="mx-auto d-block mt-4 mb-3"
                    onClick={this.fetchMoreItems(invoices)}
                    outline
                    color="success">
                    Load more results
                  </Button>
                }
              </Col>
            }
            <Col sm="5">
              <h3 className="mt-3 text-center">Search criteria</h3>
              <div>
                <FormGroup>
                  <Input
                    name="code"
                    placeholder="Code"
                    onChange={e => this.setState({
                      criteria: Object.assign(criteria, {code: e.target.value})
                    })}
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    name="city"
                    placeholder="City"
                    onChange={e => this.setState({
                      criteria: Object.assign(criteria, {city: e.target.value})
                    })}
                  />
                </FormGroup>
                <FormGroup>
                  <Autocomplete
                    renderSuggestion={this.renderSuggestion}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionSelected={this.onSuggestionSelected}
                    suggestions={this.props.autocompleteClients.autocompleteClients}
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    name="responsible"
                    placeholder="Designed Person"
                    onChange={e => this.setState({
                      criteria: Object.assign(criteria, {responsible: e.target.value})
                    })}
                  />
                </FormGroup>
                <FormGroup>
                  <DatePicker
                    className="form-control"
                    name="invoiceDate"
                    onChange={date => this.setState({
                      criteria: Object.assign(criteria, {invoiceDate: date})
                    })}
                    placeholderText="Invoice Date"
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    selected={criteria.invoiceDate}
                  />
                </FormGroup>
                <Button
                  type="submit"
                  block
                  onClick={this.executeSearch}
                  outline>
                  Search
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    );
  }
}

export default compose(
  graphql(DELETE_INVOICE_MUTATION, { name: 'deleteInvoice' }),
  graphql(ALL_INVOICES_QUERY, { name: 'allInvoices' }),
  graphql(AUTOCOMPLETE_CLIENTS_QUERY, {
    options: ({ value }) => ({
      variables: {
        searchText: value
      },
      fetchPolicy: 'network-only'
    }),
    name: 'autocompleteClients'
  })
)(InvoiceSearch);
