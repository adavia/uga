"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `
  type Invoice {
    id: Int!
    code: String!
    city: String!
    receiver: String!
    notes: String!
    invoiceDate: String!
    total: Int!
    clientId: Int!
    client: Client
    createdAt: String!
  }

  type ReportInvoice {
    id: Int
    month: String
    countMonth: Int
    totalMonth: Int
  }

  type TotalInvoice {
    totalGeneral: Int
  }

  input InvoiceInputFilter {
    code: String
    city: String
    client: Int
    responsible: String
    invoiceDate: String
  }

  input InvoiceInputReport {
    name: String
    client: Int
    invoiceDate: String
  }

  type Query {
    allInvoices(cursor: String, filter: InvoiceInputFilter): [Invoice!]!
    totalInvoices(date: String): TotalInvoice!
    reportInvoices(filter: InvoiceInputReport): [ReportInvoice!]!
    clientInvoices(cursor: String, clientId: Int!): [Invoice!]!
    getInvoice(id: Int!): Invoice!
  }

  type Mutation {
    createInvoice(
      code: String!
      city: String!
      receiver: String!
      notes: String!
      invoiceDate: String!
      clientId: Int!
      total: Int!
    ): InvoiceResponse

    updateInvoice(
      id: Int!
      code: String!
      city: String!
      receiver: String!
      notes: String!
      invoiceDate: String!
      clientId: Int!
      total: Int!
    ): InvoiceResponse

    deleteInvoice(id: Int!, clientId: Int!, total: Int!): ClientResponse
  }

  type InvoiceResponse {
    ok: Boolean!
    invoice: Invoice
    errors: [Error!]
  }
`;