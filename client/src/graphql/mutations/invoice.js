import gql from 'graphql-tag';

export const CREATE_INVOICE_MUTATION = gql`
  mutation(
    $code: String!
    $city: String!
    $receiver: String!
    $notes: String!
    $invoiceDate: String!
    $clientId: Int!
    $total: Int!
  ) {
    createInvoice(
      code: $code
      city: $city
      receiver: $receiver
      notes: $notes
      invoiceDate: $invoiceDate
      clientId: $clientId
      total: $total
    ) {
      ok
      invoice {
        id
        code
        city
        receiver
        notes
        clientId
        invoiceDate
        total
        client {
          id
          invoiceCount
          totalOilSum
        }
        createdAt
      }

      errors {
        path
        message
      }
    }
  }
`

export const DELETE_INVOICE_MUTATION = gql`
  mutation($id: Int!, $clientId: Int!, $total: Int!) {
    deleteInvoice(id: $id, clientId: $clientId, total: $total) {
      ok
      client {
        id
        invoiceCount
        totalOilSum
      }
      errors {
        path
        message
      }
    }
  }
`

export const UNIQUE_INVOICE_CODE_MUTATION = gql`
  mutation(
    $code: String!
  ) {
    uniqueCode(code: $code)
  }
`

export const UPDATE_INVOICE_MUTATION = gql`
  mutation(
    $id: Int!
    $code: String!
    $city: String!
    $receiver: String!
    $notes: String!
    $invoiceDate: String!
    $clientId: Int!
    $total: Int!
  ) {
    updateInvoice(
      id: $id
      code: $code
      city: $city
      receiver: $receiver
      notes: $notes
      invoiceDate: $invoiceDate
      clientId: $clientId
      total: $total
    ) {
      ok
      invoice {
        id
        code
        city
        receiver
        notes
        invoiceDate
        total
        client {
          id
          invoiceCount
          totalOilSum
        }
        clientId
        createdAt
      }
      errors {
        path
        message
      }
    }
  }
`
