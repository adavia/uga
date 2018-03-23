export default `
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
`
