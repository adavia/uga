export default `
  type Client {
    id: Int!
    rfc: String
    socialName: String!
    legalRepresentative: String
    comercialName: String!
    responsible: String
    phone: String
    user: User
    contract: Contract!
    emails: [Email!]!
    files: [File]
    invoiceCount: Int!
    totalOilSum: Int!
    createdAt: String!
  }

  type AutocompleteClient {
    id: Int!
    socialName: String!
    comercialName: String!
  }

  type ClientResponse {
    ok: Boolean!
    client: Client
    errors: [Error!]
  }

  type Query {
    allClients(cursor: String, searchText: String): [Client!]!
    autocompleteClients(searchText: String): [AutocompleteClient!]!
    getClient(id: Int!): Client!
  }

  type Mutation {
    createClient(
      rfc: String!
      socialName: String!
      legalRepresentative: String!
      comercialName: String!
      responsible: String!
      phone: String!
      contract: ContractInput!
      emails: [EmailInput!]!
      files: [FileInput]
    ): ClientResponse

    deleteClient(id: Int!): ClientResponse

    updateClient(
      id: Int!
      rfc: String!
      socialName: String!
      legalRepresentative: String!
      comercialName: String!
      responsible: String!
      phone: String!
      contract: ContractInput!
      emails: [EmailInput!]!
      files: [FileInput]
      deletedEmails: [EmailInput]
    ): ClientResponse
  }
`
