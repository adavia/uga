export default `
  type User {
    id: Int!
    username: String!
    email: String!
    password: String!
    createdAt: String!
  }

  type Query {
    me: User!
    allUsers(cursor: String): [User!]!
    getUser(id: Int!): User!
  }

  type UserResponse {
    ok: Boolean!
    user: User
    errors: [Error!]
  }

  type LoginResponse {
    ok: Boolean!
    token: String
    errors: [Error!]
  }

  type Mutation {
    register(
      username: String!,
      email: String!,
      password: String!
    ): UserResponse!

    login(email: String!, password: String!): LoginResponse!

    updateUser(
      id: Int!,
      username: String!,
      email: String!,
      password: String!
    ): UserResponse!

    uniqueEmail(email: String!): Boolean!
  }
`;
