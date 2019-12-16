import React from "react";

import { withFirebase } from "../Firebase";

const SignOutButton = ({ firebase }: any) => (
  <button type="button" onClick={firebase.doSignOut}>
    Log Out
  </button>
);

export default withFirebase(SignOutButton);
