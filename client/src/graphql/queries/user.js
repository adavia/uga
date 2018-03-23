import gql from 'graphql-tag';

export const ME_QUERY = gql`
  {
    me {
      id
      username
      email
    }
  }
`

export const ALL_USERS_QUERY = gql`
  query($cursor: String) {
    allUsers(cursor: $cursor) {
      id
      username
      email
      password
      createdAt
    }
  }
`

export const GET_USER_QUERY = gql`
  query($id: Int!) {
    getUser(id: $id) {
      id
      username
      email
      password
      createdAt
    }
  }
`
