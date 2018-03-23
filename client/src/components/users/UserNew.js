import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import yup from 'yup';
import {
  Container,
  Col,
  Alert
} from 'reactstrap';

import formatErrors from '../../helpers/errors';

import { UNIQUE_USER_EMAIL_MUTATION } from '../../graphql/mutations/user';
import { NEW_USER_MUTATION } from '../../graphql/mutations/user';

import UserForm from './UserForm';

class UserNew extends Component {
  constructor(props) {
    super(props);

    this.state = this.getInitialState();

    this.userSchema = yup.object().shape({
      username: yup
        .string()
        .required('this field is required')
        .matches(/^[a-z0-9]+$/i, 'must contain letters and numbers only')
        .min(3, 'must be greater than 3 characters')
        .max(25, 'must be less than 25 characters'),
      email: yup
        .string()
        .required('this field is required')
        .email('must be a valid email address')
        .test('uniqueEmail', 'has already been taken!', async (value) => {
          if (value) {
            const resp = await this.props.uniqueUserEmail({
              variables: {
                email: value
              }
            });

            return resp.data.uniqueEmail;
          }
        }),
      password: yup
        .string()
        .required('this field is required')
        .min(5, 'must be greater than 5 characters')
        .max(100, 'must be less than 100 characters')
    });
  }

  getInitialState = () => {
    return {
      username: '',
      email: '',
      password: '',
      loading: false,
      errors: {}
    }
  }

  onChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  onSubmit = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    const payload = {
      username: this.state.username,
      email: this.state.email,
      password: this.state.password
    }

    try {
      await this.userSchema.validate({
        username: payload.username,
        email: payload.email,
        password: payload.password
      }, { abortEarly: false });
    } catch (e) {
      return this.setState({
        errors: formatErrors(e.inner),
        loading: false
      })
    }

    const resp = await this.props.register({
      variables: payload
    });

    const { ok, errors } = resp.data.register;

    if (ok) {
      this.setState(this.getInitialState());
      this.props.history.push('/users');
    } else {
      this.setState({
        errors: formatErrors(errors),
        loading: false
      });
    }
  }

  render() {
    const { ...user } = this.state;

    return (
      <section>
        <div className="title">
          <h2>Create new users</h2>
        </div>
        <Container>
          <div className="row justify-content-md-center">
            <Col sm="6" className="mt-2">
              {user.errors.error &&
                <Alert color="danger">
                  {user.errors.error[0]}
                </Alert>
              }
              <UserForm
                user={user}
                onSubmit={this.onSubmit}
                onChange={this.onChange}
              />
            </Col>
          </div>
        </Container>
      </section>
    );
  };
}

export default compose(
  graphql(NEW_USER_MUTATION, { name: 'register' }),
  graphql(UNIQUE_USER_EMAIL_MUTATION, { name: 'uniqueUserEmail' })
)(UserNew);
