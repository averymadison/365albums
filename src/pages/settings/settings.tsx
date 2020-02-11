import { AuthUserContext, withPermissions } from '../../components/session';

import ChangePasswordForm from './change-password';
import LoginManagement from './login-manager';
import React from 'react';
import { ResetPasswordForm } from '../reset-password/reset-password';
import SignOutButton from '../../components/sign-out-button/sign-out-button';
import { compose } from 'recompose';

const Settings = () => (
  <AuthUserContext.Consumer>
    {(authUser: any) => (
      <div className="sign-in-page">
        <div className="container">
          <h1>Settings</h1>
          <p>{authUser.email}</p>
          <div className="sign-in-form">
            <ResetPasswordForm />
            <ChangePasswordForm />
            <LoginManagement authUser={authUser} />
            <SignOutButton />
          </div>
        </div>
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = (authUser: any) => !!authUser;

export default compose(withPermissions(condition))(Settings);
