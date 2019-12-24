import React from "react";
import { compose } from "recompose";
import { ResetPasswordForm } from "../ResetPassword";
import ChangePasswordForm from "./ChangePassword";
import LoginManagement from "./LoginManagement";
import SignOutButton from "../../components/SignOutButton";
import {
  AuthUserContext,
  withEmailVerification,
  withPermissions
} from "../../components/Session";

const Settings = () => (
  <AuthUserContext.Consumer>
    {(authUser: any) => (
      <div>
        <h1>Settings</h1>
        {authUser.email}
        <ResetPasswordForm />
        <ChangePasswordForm />
        <LoginManagement authUser={authUser} />
        <SignOutButton />
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = (authUser: any) => !!authUser;

export default compose(
  withEmailVerification,
  withPermissions(condition)
)(Settings);
