import React from "react";
import { withFirebase } from "../Firebase";
import { FiLogOut } from "react-icons/fi";

const SignOutButton = ({ firebase }: any) => (
  <button
    className="button icon-button"
    type="button"
    onClick={firebase.doSignOut}
  >
    <FiLogOut />
  </button>
);

export default withFirebase(SignOutButton);
