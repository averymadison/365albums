import React from 'react';
import { withPermissions } from '../../components/Session';

const Home = () => (
  <div>
    <h1>Home</h1>
    <p>You are signed in!</p>
  </div>
);

const condition = (authUser: any) => !!authUser;

export default withPermissions(condition)(Home);
