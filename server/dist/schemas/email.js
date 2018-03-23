"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `
  type Email {
    id: Int!
    address: String!
  }

  input EmailInput {
    id: Int
    address: String!
  }
`;