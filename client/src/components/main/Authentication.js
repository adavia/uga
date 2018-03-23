import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import { graphql } from 'react-apollo';
import { Route, Redirect } from 'react-router-dom';

import { ME_QUERY } from '../../graphql/queries/user';

class Authentication extends Component {
  componentDidUpdate = async (prevProps) => {
    if (!this.currentUser()) {
      await prevProps.client.resetStore();
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
    const { component: Component, layout: Layout, ...rest } = this.props;

    if (this.isLoading()) {
      return (
        <div className="text-center mt-4">
          <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i> loading app...
        </div>
      );
    }

    return (
      <Route
        {...rest}
        render={props =>
          this.currentUser()
            ?
              Layout ?
                <Layout currentUser={this.currentUser()}>
                  <Component currentUser={this.currentUser()} {...props} />
                </Layout>
              : <Component currentUser={this.currentUser()} {...props} />
            : <Redirect
                to={{
                  pathname: '/auth/login',
                  state: { from: props.location }
                }}
              />
        }
      />
    )
  }
}

export default withApollo(graphql(
  ME_QUERY,
  { name: 'auth'}
)(Authentication));
