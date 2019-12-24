import React from "react";
import { Link } from "react-router-dom";
import Logo from "../Logo";
import SignOutButton from "../SignOutButton";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import { AuthUserContext } from "../Session";
import { FiSettings, FiHome, FiMenu } from "react-icons/fi";
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
    <Link to={ROUTES.HOME} className="logo">
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
  </React.Fragment>
);

const NavigationNonAuth = () => (
  <React.Fragment>
    <Link to={ROUTES.LANDING} className="logo">
      <Logo />
    </Link>
    <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
    <Link to={ROUTES.SIGN_IN}>Sign In</Link>
  </React.Fragment>
);

export default Nav;
