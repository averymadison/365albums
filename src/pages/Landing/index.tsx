import React from "react";
import { Link } from "react-router-dom";
import * as ROUTES from "../../constants/routes";

const Landing = () => (
  <div>
    <h1>365albums</h1>
    <p>Listen to an album a day.</p>
    <Link to={ROUTES.SIGN_UP} className="button">
      Sign Up
    </Link>
    <Link to={ROUTES.SIGN_IN} className="button">
      Sign In
    </Link>
  </div>
);

export default Landing;
