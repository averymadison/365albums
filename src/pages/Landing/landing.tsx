import "./landing.css";

import * as ROUTES from "../../constants/routes";

import { Link, Redirect } from "react-router-dom";

import { AuthUserContext } from "../../components/session";
// import React from "react";

const Landing = () => (
  <div className="landing">
    <h1>365 Albums</h1>
    <p>An album a day keeps the ennui away</p>
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? (
          <Redirect to={ROUTES.HOME} />
        ) : (
          <div>
            <Link to={ROUTES.SIGN_UP} className="button">
              Sign Up
            </Link>
            <Link to={ROUTES.SIGN_IN} className="button">
              Sign In
            </Link>
          </div>
        )
      }
    </AuthUserContext.Consumer>
  </div>
);

export default Landing;
