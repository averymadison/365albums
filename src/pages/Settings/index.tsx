import React from 'react';
import { ResetPasswordForm } from '../ResetPassword';
import ChangePasswordForm from './ChangePassword';
import LoginManagement from './LoginManagement';
import { withPermissions, AuthUserContext } from '../../components/Session';

const Settings = () => (
  <AuthUserContext.Consumer>
    {(authUser: any) => (
      <div>
        <h1>Settings</h1>
        {authUser.email}
        <ResetPasswordForm />
        <ChangePasswordForm />
        <LoginManagement authUser={authUser} />
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = (authUser: any) => !!authUser;

export default withPermissions(condition)(Settings);
