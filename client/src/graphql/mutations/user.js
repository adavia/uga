import gql from 'graphql-tag';

export const NEW_USER_MUTATION = gql`
  mutation(
    $username: String!
    $email: String!
    $password: String!
  ) {
    register(
      username: $username
      email: $email
      password: $password
    ) {
      ok
      errors {
        path
        message
      }
    }
  }
`

export const UNIQUE_USER_EMAIL_MUTATION = gql`
  mutation(
    $email: String!
  ) {
    uniqueEmail(email: $email)
  }
`

export const LOGIN_MUTATION = gql`
  mutation(
    $email: String!
    $password: String!
  ) {
    login(
      email: $email
      password: $password
    ) {
      ok
      token
      errors {
        path
        message
      }
    }
  }
`

export const UPDATE_USER_MUTATION = gql`
  mutation(
    $id: Int!
    $username: String!
    $email: String!
    $password: String!
  ) {
    updateUser(
      id: $id
      username: $username
      email: $email
      password: $password
    ) {
      ok
      errors {
        path
        message
      }
    }
  }
`
