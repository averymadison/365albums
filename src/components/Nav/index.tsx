import React from "react";
import { Link } from "react-router-dom";
import Logo from "../Logo";
import SignOutButton from "../SignOutButton";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import { AuthUserContext } from "../Session";
import { FiSettings, FiHome } from "react-icons/fi";
import "./nav.css";

const Nav = () => (
  <header className="header">
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? (
          <NavigationAuth authUser={authUser} />
        ) : (
          <NavigationNonAuth />
        )
      }
    </AuthUserContext.Consumer>
  </header>
);

const NavigationAuth = ({ authUser }: any) => (
  <nav className="header-nav">
    <Link to={ROUTES.HOME}>
      <Logo />
    </Link>

    {!!authUser.roles[ROLES.ADMIN] && <Link to={ROUTES.ADMIN}>Admin</Link>}
    <Link className="button icon-button" to={ROUTES.HOME}>
      <FiHome />
    </Link>
    <Link className="button icon-button" to={ROUTES.SETTINGS}>
      <FiSettings />
    </Link>
    <SignOutButton />
  </nav>
);

const NavigationNonAuth = () => (
  <nav className="header-nav">
    <Link to={ROUTES.LANDING}>
      <Logo />
    </Link>
    <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
    <Link to={ROUTES.SIGN_IN}>Sign In</Link>
  </nav>
);

export default Nav;
