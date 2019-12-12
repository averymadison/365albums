import React from 'react';
import { FiLogOut } from 'react-icons/fi';

import { withFirebase } from '../Firebase';

const SignOutButton = ({ firebase }: any) => (
  <button type="button" onClick={firebase.doSignOut}>
    <FiLogOut />
  </button>
);

export default withFirebase(SignOutButton);
