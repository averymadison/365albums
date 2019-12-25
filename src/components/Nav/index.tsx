import React from "react";
import { Link } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import { AuthUserContext } from "../Session";
import { FiSettings, FiHome, FiMusic } from "react-icons/fi";
import "./nav.css";

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
