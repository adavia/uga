import gql from 'graphql-tag';

export const ALL_INVOICES_QUERY = gql`
  query($cursor: String, $filter: InvoiceInputFilter) {
    allInvoices(cursor: $cursor, filter: $filter) {
      id
      code
      city
      receiver
      notes
      invoiceDate
      total
      clientId
      client {
        id
        comercialName
        responsible
        contract {
          id
          oilPayment
        }
      }
      createdAt
    }
  }
`

export const REPORT_INVOICES_QUERY = gql`
  query($filter: InvoiceInputReport) {
    reportInvoices(filter: $filter) {
      month
      countMonth
      totalMonth
    }
  }
`

export const TOTAL_INVOICES_QUERY = gql`
  query($date: String) {
    totalInvoices(date: $date) {
      totalGeneral
    }
  }
`

export const CLIENT_INVOICES_QUERY = gql`
  query($cursor: String, $clientId: Int!) {
    clientInvoices(cursor: $cursor, clientId: $clientId) {
      id
      code
      city
      receiver
      notes
      invoiceDate
      total
      clientId
      createdAt
    }
  }
`

export const GET_INVOICE_QUERY = gql`
  query($id: Int!) {
    getInvoice(id: $id) {
      id
      code
      city
      receiver
      notes
      invoiceDate
      total
      clientId
      createdAt
    }
  }
`
