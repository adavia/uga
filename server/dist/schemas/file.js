"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = `
  type File {
    id: Int!
    name: String!
    type: String!
    path: String!
  }

  input FileInput {
    id: Int
    name: String!
    type: String!
    path: String!
  }
`;