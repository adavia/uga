import React from 'react';
import { Container } from 'reactstrap';
import { Link } from 'react-router-dom';
import logoUGA from '../../images/logo_uga_sm.png';

const GenericNotFound = () => {
  return (
    <div className="not-found">
      <Container>
        <div className="content">
          <img
            src={logoUGA}
            width="250"
            className="mb-3 mx-auto d-block"
            alt="Logo UGA Soluciones Ambientales"
          />
          <h1 className="text-center mb-3">Page not found</h1>
          <Link to="/" className="btn btn-outline-success btn-block">Go back to the index page</Link>
        </div>
      </Container>
    </div>
  );
}

export default GenericNotFound;