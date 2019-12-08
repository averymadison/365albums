import React from 'react';
import { compose } from 'recompose';
import {
  withEmailVerification,
  withPermissions
} from '../../components/Session';

const Home = () => (
  <div>
    <h1>Home</h1>
    <p>You are signed in!</p>
  </div>
);

const condition = (authUser: any) => !!authUser;

export default compose(withEmailVerification, withPermissions(condition))(Home);
