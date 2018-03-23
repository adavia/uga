import gql from 'graphql-tag';

export const ALL_CLIENTS_QUERY = gql`
  query($cursor: String, $searchText: String) {
    allClients(cursor: $cursor, searchText: $searchText) {
      id
      rfc
      socialName
      legalRepresentative
      comercialName
      responsible
      phone
      invoiceCount
      totalOilSum
      contract {
        id
        oilPayment
        contractDate
        contractEnd
        contact
        address
      }
      emails {
        id
        address
      }
      files {
        id
        name
        type
        path
      }
      createdAt
    }
  }
`

export const AUTOCOMPLETE_CLIENTS_QUERY = gql`
  query($searchText: String) {
    autocompleteClients(searchText: $searchText) {
      id
      socialName
      comercialName
    }
  }
`

export const GET_CLIENT_QUERY = gql`
  query($id: Int!) {
    getClient(id: $id) {
      id
      rfc
      socialName
      legalRepresentative
      comercialName
      responsible
      phone
      invoiceCount
      totalOilSum
      contract {
        id
        oilPayment
        contractDate
        contractEnd
        contact
        address
      }
      emails {
        id
        address
      }
      files {
        id
        name
        type
        path
      }
      createdAt
    }
  }
`
