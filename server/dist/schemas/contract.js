"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `
  type Contract {
    id: Int
    oilPayment: Float!
    contractDate: String
    contractEnd: String
    contact: String
    address: String
  }

  input ContractInput {
    id: Int
    oilPayment: Float!
    contractDate: String!
    contractEnd: String!
    contact: String!
    address: String!
  }
`;