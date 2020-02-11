import './nav.css';

import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

import { FiHome, FiMusic, FiSettings } from 'react-icons/fi';

import { AuthUserContext } from '../session';
import { Link } from 'react-router-dom';
import React from 'react';

const Nav = () => (
  <AuthUserContext.Consumer>
    {authUser => authUser && <NavigationAuth authUser={authUser} />}
  </AuthUserContext.Consumer>
);

const NavigationAuth = ({ authUser }: any) => (
  <nav className="nav">
    <Link className="button icon-button" to={ROUTES.HOME}>
      <FiHome />
    </Link>
    <Link className="button icon-button" to={ROUTES.CHARTS}>
      <FiMusic />
    </Link>
    <Link className="button icon-button" to={ROUTES.SETTINGS}>
      <FiSettings />
    </Link>
    {!!authUser.roles[ROLES.ADMIN] && <Link to={ROUTES.ADMIN}>Admin</Link>}
  </nav>
);

export default Nav;
