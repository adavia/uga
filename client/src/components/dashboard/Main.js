import React, { Component } from 'react';
//import { Link } from 'react-router-dom';

import NavBar from './NavBar';

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //showSidebar: false,
      menuClients: false
    };
  }

  // toggleSidebar = (e) => {
  //   e.preventDefault();
  //   this.setState({
  //     showSidebar: !this.state.showSidebar
  //   });
  // }

  toggleMenu = (e) => {
    e.preventDefault();
    this.setState({
      menuClients: !this.state.menuClients
    });
  }

  render() {
    const { currentUser, children } = this.props;
    //const { showSidebar } = this.state;

    //const active = showSidebar ? 'active' : '';

    return (
      <div>
      {/*<div className="d-flex align-items-stretch">
        <aside className={`sidebar ${active}`}>
          <div className="sidebar-header">
            <h3 className="m-0">Collapsible Sidebar</h3>
          </div>
          <ul className="menu-items">
            <li>
              <a
                onClick={this.toggleMenu}
                href=""
                data-toggle="collapse"
                aria-expanded={menuClients}>
                Clients
              </a>
              <Collapse
                tag="ul"
                isOpen={menuClients}
                className="list-unstyled ml-3">
                <li>
                  <Link to={{
                    pathname: '/clients/new',
                    state: { modal: true }
                  }}>
                    Create new client
                  </Link>
                  <Link to="/">
                    All clients
                  </Link>
                </li>
              </Collapse>
            </li>
            <li><a href="">Invoices</a></li>
          </ul>
        </aside>*/}

        <NavBar user={currentUser} />
        {children}
      </div>
    );
  };
}

export default Main;
