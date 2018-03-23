import { withApollo } from 'react-apollo';
import React, { Component } from 'react';
import { graphql } from 'react-apollo';

import { ME_QUERY } from '../../graphql/queries/user';

export default (WrappedComponent) => {
  class AuthHOC extends Component {
    componentDidUpdate = async (prevProps) => {
      if (!this.currentUser()) {
        const store = prevProps.client.resetStore();

        if (store) {
          if (localStorage.getItem('token')) {
            localStorage.removeItem('token');
          }
          prevProps.history.push('/auth/login');
        }
      }
    }

    // Check if there is validated user logged
    currentUser = () => {
      return this.props.auth.me;
    }

    // Check if the Authorization query is loading
    isLoading = () => {
      return this.props.auth.loading;
    }

    render () {
      if (this.isLoading()) {
        return <div>Loading...</div>;
      }

      return (
        <WrappedComponent
          currentUser={this.currentUser}
          {...this.props}
        />
      );
    }
  }

  return withApollo(graphql(
    ME_QUERY, {
      name: 'auth'
    }
  )(AuthHOC));
}
