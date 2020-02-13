import React from "react";
import { Search } from "..";
import { withFirebase } from "../firebase";

const SignOutButton = ({ firebase }: any) => (
  <button className="button" type="button" onClick={firebase.doSignOut}>
    Sign out
  </button>
);

export default withFirebase(SignOutButton);
