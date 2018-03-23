import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import '../../styles/index.css';
import 'react-datepicker/dist/react-datepicker.css';

import GenericNotFound from './GenericNotFound';

import Authentication from '../main/Authentication';
import Login from '../auth/Login';
import Main from '../dashboard/Main';

import UserList from '../users/UserList';
import UserNew from '../users/UserNew';
import UserEdit from '../users/UserEdit';

import ClientList from '../clients/ClientList';
import ClientShow from '../clients/ClientShow';
import ClientNew from '../clients/ClientNew';
import ClientEdit from '../clients/ClientEdit';

import InvoiceNew from '../invoices/InvoiceNew';
import InvoiceShow from '../invoices/InvoiceShow';
import InvoiceEdit from '../invoices/InvoiceEdit';
import InvoiceSearch from '../invoices/InvoiceSearch';

class Routes extends Component {
  constructor(props) {
    super(props);

    this.prevLocation = props.location;
  }

  componentWillUpdate(nextProps) {
    const { location, location: { state } } = this.props;
    const { action } = nextProps.history;

    if (action !== 'POP' && (!state || !state.modal)) {
      this.prevLocation = location;
    }
  }

  render() {
    const { location, location: { state } } = this.props;

    const isModal = !!(state
      && state.modal
      && this.prevLocation !== location
    );

    return (
      <div>
        <Switch location={isModal ? this.prevLocation : location}>
          <Authentication path="/" layout={Main} exact component={ClientList} />
          <Authentication path="/invoices" layout={Main} exact component={InvoiceSearch} />
          <Authentication path="/users" layout={Main} exact component={UserList} />
          <Authentication path="/users/:id/edit" layout={Main} exact component={UserEdit} />
          <Authentication path="/users/new" layout={Main} exact component={UserNew} />
          <Route path="/auth/login" exact component={Login} />
          <Authentication
            exact
            path="/clients/new"
            component={props =>
              <div>
                {isModal ? null : <Main {...props} />}
                <ClientNew
                  {...props}
                  onModalClose={() => this.props.history.push('/')}
                />
              </div>
            }
          />
          <Authentication
            exact
            path="/invoices/:id"
            component={props =>
              <div>
                {isModal ? null : <Main {...props} />}
                <InvoiceShow
                  {...props}
                  onModalClose={() => this.props.history.push('/')}
                />
              </div>
            }
          />
          <Authentication path="/clients/:id" layout={Main} exact component={ClientShow} />
          <Authentication
            exact
            path="/clients/:id/edit"
            component={props =>
              <div>
                {isModal ? null : <Main {...props} />}
                <ClientEdit
                  {...props}
                  onModalClose={() => this.props.history.push('/')}
                />
              </div>
            }
          />
          <Authentication
            exact
            path="/clients/:id/invoices/new"
            component={props =>
              <div>
                {isModal ? null : <Main {...props} />}
                <InvoiceNew
                  {...props}
                  onModalClose={() => this.props.history.push('/')}
                />
              </div>
            }
          />
          <Authentication
            exact
            path="/clients/:id/invoices/:invoiceId/edit"
            component={props =>
              <div>
                {isModal ? null : <Main {...props} />}
                <InvoiceEdit
                  {...props}
                  onModalClose={() => this.props.history.push('/')}
                />
              </div>
            }
          />
          <Route component={GenericNotFound} />
        </Switch>
        {isModal ?
          <Authentication
            path='/clients/new'
            component={ClientNew}
          />
        : null}
        {isModal ?
          <Authentication
            path='/clients/:id/edit'
            component={ClientEdit}
          />
        : null}
        {isModal ?
          <Authentication
            path='/invoices/:id'
            component={InvoiceShow}
          />
        : null}
        {isModal ?
          <Authentication
            path='/clients/:id/invoices/new'
            component={InvoiceNew}
          />
        : null}
        {isModal ?
          <Authentication
            path='/clients/:id/invoices/:invoiceId/edit'
            component={InvoiceEdit}
          />
        : null}
      </div>
    );
  }
}

export default Routes;
