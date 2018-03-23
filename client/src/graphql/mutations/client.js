import gql from 'graphql-tag';

export const CREATE_CLIENT_MUTATION = gql`
  mutation(
    $rfc: String!
    $socialName: String!
    $legalRepresentative: String!
    $comercialName: String!
    $responsible: String!
    $phone: String!
    $contract: ContractInput!
    $emails: [EmailInput!]!
    $files: [FileInput]!
  ) {
    createClient(
      rfc: $rfc
      socialName: $socialName
      legalRepresentative: $legalRepresentative
      comercialName: $comercialName
      responsible: $responsible
      phone: $phone
      contract: $contract
      emails: $emails
      files: $files
    ) {
      ok
      client {
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
      errors {
        path
        message
      }
    }
  }
`

export const DELETE_CLIENT_MUTATION = gql`
  mutation($id: Int!) {
    deleteClient(id: $id) {
      ok
      errors {
        path
        message
      }
    }
  }
`

export const UPDATE_CLIENT_MUTATION = gql`
  mutation(
    $id: Int!
    $rfc: String!
    $socialName: String!
    $legalRepresentative: String!
    $comercialName: String!
    $responsible: String!
    $phone: String!
    $contract: ContractInput!
    $emails: [EmailInput!]!
    $files: [FileInput]!
    $deletedEmails: [EmailInput]!
  ) {
    updateClient(
      id: $id
      rfc: $rfc
      socialName: $socialName
      legalRepresentative: $legalRepresentative
      comercialName: $comercialName
      responsible: $responsible
      phone: $phone
      contract: $contract
      emails: $emails
      files: $files
      deletedEmails: $deletedEmails
    ) {
      ok
      client {
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
      errors {
        path
        message
      }
    }
  }
`
