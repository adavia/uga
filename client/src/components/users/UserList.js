import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { Link } from 'react-router-dom';
import {
  Container,
  ButtonGroup,
  Button
} from 'reactstrap';

import { ALL_USERS_QUERY } from '../../graphql/queries/user';

class UserList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasMoreItems: true
    }
  }

  fetchMoreItems = () => (e) => {
    const { allUsers, fetchMore } = this.props.data;

    const variables = {
      cursor: allUsers[allUsers.length - 1].createdAt
    };

    fetchMore({
      variables,
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }

        if (fetchMoreResult.allUsers.length < 10) {
          this.setState({ hasMoreItems: false })
        }

        return {
          ...previousResult,
          allUsers: [...previousResult.allUsers, ...fetchMoreResult.allUsers]
        }
      }
    })
  }

  render() {
    const { allUsers, loading } = this.props.data;
    const { hasMoreItems } = this.state;

    return (
      <section>
        <div className="title">
          <h2>Manage your users</h2>
        </div>
        <Container>
          {loading ?
            <div className="text-center mt-4">
              <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
            </div>
          : <div className="mt-3">
              <Link
                to="/users/new"
                className="float-right btn btn-outline-success">
                Create a new user
              </Link>
              {allUsers.map(user =>
                <div key={`user-${user.id}`} className="user-content">
                  <Link to={`/users/${user.id}/edit`}>
                    <h1 className="mb-1">
                      {user.username}
                    </h1>
                  </Link>
                  <p>{user.email}</p>
                    <ButtonGroup>
                      <Link
                        className="btn btn-outline-success"
                        to={`/users/${user.id}/edit`}>
                        Update user information
                      </Link>
                      <Button
                        outline
                        color="danger">
                        Delete
                      </Button>
                    </ButtonGroup>
                </div>
              )}
              { hasMoreItems && allUsers.length >= 10 &&
                <Button
                  className="mx-auto d-block mt-4 mb-3"
                  onClick={this.fetchMoreItems}
                  outline
                  color="success">
                  Load more results
                </Button>
              }
            </div>
          }
        </Container>
      </section>
    );
  }
}

export default graphql(ALL_USERS_QUERY, {
  options: props => ({
    fetchPolicy: 'network-only'
  })
})(UserList);
