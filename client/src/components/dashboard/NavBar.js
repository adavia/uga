import { withApollo } from 'react-apollo';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  Container,
  NavLink,
  Button
} from 'reactstrap';
import { withRouter } from 'react-router-dom';

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    }
  }

  logOutUser = async (e) => {
    e.preventDefault();

    const { client, history } = this.props;
    const store = await client.resetStore();

    if (store) {
      localStorage.removeItem('token');
    }

    history.push('/auth/login');
  }

  toggleNavBar = (e) => {
    e.preventDefault();
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    const { user } = this.props;

    return (
      <Navbar className="main-nav" expand="md">
        <Container>
          <NavbarToggler onClick={this.toggleNavBar} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav navbar>
              <NavItem>
                <Link className="nav-link" to={{
                  pathname: '/clients/new',
                  state: { modal: true }
                }}>
                  <i className="fa fa-plus" aria-hidden="true"></i> Create new client
                </Link>
              </NavItem>
              <NavItem>
                <Link className="nav-link" to="/">
                  <i className="fa fa-address-card-o" aria-hidden="true"></i> All clients
                </Link>
              </NavItem>
              <NavItem>
                <Link className="nav-link" to="/invoices">
                  <i className="fa fa-files-o" aria-hidden="true"></i> All invoices
                </Link>
              </NavItem>
              <NavItem>
                <Link className="nav-link" to="/users">
                  <i className="fa fa-users" aria-hidden="true"></i> Manage users
                </Link>
              </NavItem>
            </Nav>
          </Collapse>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <i className="fa fa-user-o" aria-hidden="true"></i> <span className="navbar-text mr-3">Hi!, {user.email}</span>
              </NavItem>
              <NavItem>
                <NavLink href="" onClick={this.logOutUser}>
                  <Button
                    outline
                    size="sm"
                    color="success">
                    Sign Out
                  </Button>
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    );
  };
}

export default withApollo(withRouter(NavBar));
