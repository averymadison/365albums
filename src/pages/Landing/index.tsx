import React from "react";
import { Link } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import "./landing.css";
import { AuthUserContext } from "../../components/Session";

const Landing = () => (
  <div className="landing">
    <h1>365albums</h1>
    <p>An album a day keeps the ennui away</p>
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? (
          <Link to={ROUTES.HOME} className="button">
            Go Home
          </Link>
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
