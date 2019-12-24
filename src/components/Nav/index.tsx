import React from "react";
import { Link } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import { AuthUserContext } from "../Session";
import { FiSettings, FiHome, FiMusic } from "react-icons/fi";
import "./nav.css";

const Nav = () => (
  <nav className="nav">
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? (
          <NavigationAuth authUser={authUser} />
        ) : (
          <NavigationNonAuth />
        )
      }
    </AuthUserContext.Consumer>
  </nav>
);

const NavigationAuth = ({ authUser }: any) => (
  <React.Fragment>
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
  </React.Fragment>
);

const NavigationNonAuth = () => (
  <React.Fragment>
    <Link className="button icon-button" to={ROUTES.HOME}>
      <FiHome />
    </Link>
    <Link to={ROUTES.SIGN_UP} className="button">
      Sign Up
    </Link>
    <Link to={ROUTES.SIGN_IN} className="button">
      Sign In
    </Link>
  </React.Fragment>
);

export default Nav;
