import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import yup from 'yup';
import {
  Container,
  Col,
  Form,
  Input,
  Button,
  Alert,
  FormFeedback
} from 'reactstrap';

import logoUGA from '../../images/logo_uga.png';

import formatErrors from '../../helpers/errors';

import { LOGIN_MUTATION } from '../../graphql/mutations/user';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = this.getInitialState();

    this.loginSchema = yup.object().shape({
      email: yup
        .string()
        .required('this field is required'),
      password: yup
        .string()
        .required('this field is required')
    });
  }

  getInitialState = () => {
    return {
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
      email: this.state.email,
      password: this.state.password
    }

    try {
      await this.loginSchema.validate({
        email: payload.email,
        password: payload.password
      }, { abortEarly: false });
    } catch (e) {
      return this.setState({
        errors: formatErrors(e.inner),
        loading: false
      })
    }

    const resp = await this.props.mutate({
      variables: payload
    });

    const { ok, token, errors } = resp.data.login;

    if (ok) {
      this.setState(this.getInitialState());
      localStorage.setItem('token', token);
      this.props.history.push('/')
    } else {
      this.setState({
        errors: formatErrors(errors),
        loading: false
      });
    }
  }

  render() {
    const { errors, loading } = this.state;

    return (
      <div className="login-wrapper">
        <Container>
          <div className="row justify-content-md-center">
            <Col sm="6" className="mt-5 login-form">
              <img
                src={logoUGA}
                width="250"
                className="mb-3 mx-auto d-block"
                alt="Logo UGA Soluciones Ambientales"
              />
              <h1 className="text-center mb-3">Sign in to the application</h1>
              {errors.error &&
                <Alert color="danger">
                  {errors.error[0]}
                </Alert>
              }
              <Form onSubmit={this.onSubmit}>
                <div className="form-group">
                  <Input
                    valid={!errors.email && null}
                    onChange={this.onChange}
                    name="email"
                    value={this.state.email}
                    placeholder="Your email address"
                  />
                  {errors.email &&
                    <FormFeedback>{errors.email[0]}</FormFeedback>
                  }
                </div>
                <div className="form-group">
                  <Input
                    valid={!errors.password && null}
                    type="password"
                    onChange={this.onChange}
                    name="password"
                    value={this.state.password}
                    placeholder="Your password"
                  />
                  {errors.password &&
                    <FormFeedback>{errors.password[0]}</FormFeedback>
                  }
                </div>
                <Button
                  outline
                  block
                  color="success"
                  type="submit"
                  disabled={loading}>
                  Sign In {loading && <i className="fa fa-circle-o-notch fa-spin"></i>}
                </Button>
              </Form>
            </Col>
          </div>
        </Container>
      </div>
    );
  };
}

export default compose(
  graphql(LOGIN_MUTATION)
)(Login);
