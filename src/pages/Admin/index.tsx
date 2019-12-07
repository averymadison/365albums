import React from 'react';
import { withPermissions } from '../../components/Session';
import * as ROLES from '../../constants/roles';

const Admin = () => (
  <div>
    <h1>Admin</h1>
    <p>Restricted to admins</p>
  </div>
);

const condition = (authUser: any) => authUser && !!authUser;
// !!authUser.roles[ROLES.ADMIN];

export default withPermissions(condition)(Admin);
