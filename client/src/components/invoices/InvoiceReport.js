import React, { Component } from 'react';
import { graphql, withApollo } from 'react-apollo';
import moment from 'moment';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  ButtonGroup,
  FormGroup,
  Button
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Autocomplete from '../shared/Autocomplete';

import { AUTOCOMPLETE_CLIENTS_QUERY } from '../../graphql/queries/client';
import { REPORT_INVOICES_QUERY, TOTAL_INVOICES_QUERY } from '../../graphql/queries/invoice';

class InvoiceReport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      criteria: {
        name: '',
        client: undefined,
        invoiceDate: undefined
      },
      loading: false,
      invoices: [],
      dateGeneral: undefined,
      totalGeneral: undefined
    }
  }

  toggleForms = (name) => (e) => {
    const { criteria } = this.state;

    this.setState({
      criteria: Object.assign(criteria, { name: name })
    });
  }

  _executeSearch = async (e) => {
    e.preventDefault();

    const { criteria, dateGeneral } = this.state;

    this.setState({ loading: true });

    if (criteria.name === 'totalAnualClient') {
      const result = await this.props.client.query({
        query: REPORT_INVOICES_QUERY,
        variables: { filter: criteria },
        fetchPolicy: 'network-only'
      });

      this.setState({
        invoices: result.data.reportInvoices,
        loading: false
      });
    }

    if (criteria.name === 'totalAnualGeneral') {
      const result = await this.props.client.query({
        query: TOTAL_INVOICES_QUERY,
        variables: { date: dateGeneral },
        fetchPolicy: 'network-only'
      });

      this.setState({
        totalGeneral: result.data.totalInvoices.totalGeneral,
        loading: false
      });
    }
  }

  renderSuggestion = (suggestion) => {
    return (
      <div>
        {suggestion.comercialName}
      </div>
    );
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.props.data.refetch({ searchText: value });
  }

  onSuggestionSelected = (event, { suggestion }) => {
    const { criteria } = this.state;

    this.setState({
      criteria: Object.assign(criteria, { client: suggestion.id })
    });
  }

  render() {
    const { modal, toggleModal } = this.props;
    const { criteria, invoices, loading, totalGeneral, dateGeneral } = this.state;

    const chartData = invoices.map(invoice => {
      return {
        month: moment(invoice.month, 'M').format('MMMM'),
        totalMonth: invoice.totalMonth,
        countMonth: invoice.countMonth
      }
    });

    return (
      <Modal size="lg" isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Advanced graph report</ModalHeader>
        <ModalBody>
          <ButtonGroup>
            <Button
              outline
              color="success"
              onClick={this.toggleForms('totalAnualClient')}>
              Annual total by client
            </Button>
            <Button
              outline
              color="secondary"
              onClick={this.toggleForms('totalAnualGeneral')}>
              General annual total
            </Button>
          </ButtonGroup>
          <div className="mt-3">
            {criteria.name === 'totalAnualClient' &&
              <Card>
                <CardBody>
                  <FormGroup>
                    <Autocomplete
                      renderSuggestion={this.renderSuggestion}
                      onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                      onSuggestionSelected={this.onSuggestionSelected}
                      suggestions={this.props.data.autocompleteClients}
                    />
                  </FormGroup>
                  <FormGroup>
                    <DatePicker
                      className="form-control"
                      name="invoiceDate"
                      onChange={date => this.setState({
                        criteria: Object.assign(criteria, {invoiceDate: date})
                      })}
                      placeholderText="Year"
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
                    onClick={this._executeSearch}
                    disabled={loading}
                    outline>
                    Generate report {loading && <i className="fa fa-circle-o-notch fa-spin"></i>}
                  </Button>
                </CardBody>
              </Card>
            }
            {criteria.name === 'totalAnualGeneral' &&
              <Card>
                <CardBody>
                  <FormGroup>
                    <DatePicker
                      className="form-control"
                      name="invoiceDate"
                      onChange={date => this.setState({ dateGeneral: date })}
                      placeholderText="Year"
                      peekNextMonth
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      selected={this.state.dateGeneral}
                    />
                  </FormGroup>
                  <Button
                    type="submit"
                    block
                    onClick={this._executeSearch}
                    disabled={loading}
                    outline>
                    Generate report {loading && <i className="fa fa-circle-o-notch fa-spin"></i>}
                  </Button>
                </CardBody>
              </Card>
            }
          </div>
          {criteria.name === 'totalAnualClient' && chartData.length > 0 &&
            <div className="mt-3">
              <h2 className="text-center">
                Results generated for {moment(new Date(criteria.invoiceDate)).year()}
              </h2>
              <BarChart width={600} height={300} style={{margin: '0 auto'}} data={chartData}
              margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                <XAxis dataKey="month"/>
                <YAxis/>
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip/>
                <Legend />
                <Bar dataKey="totalMonth" name="TOTAL L." fill="#82ca9d" />
                <Bar dataKey="countMonth" name="TOTAL INVOICES" fill="#8884d8" />
              </BarChart>
            </div>
          }
          {criteria.name === 'totalAnualGeneral' && totalGeneral &&
            <div className="mt-3 text-center">
              <h2>Anual oil picking - {moment(new Date(dateGeneral)).format('MM')} / {moment(new Date(dateGeneral)).year()}</h2>
              <h1>{totalGeneral} L.</h1>
            </div>
          }
        </ModalBody>
        <ModalFooter>
          <Button outline onClick={toggleModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default withApollo(
  graphql(AUTOCOMPLETE_CLIENTS_QUERY, {
    options: ({ value }) => ({
      variables: {
        searchText: value
      },
      fetchPolicy: 'network-only'
    })
  }
)(InvoiceReport));
