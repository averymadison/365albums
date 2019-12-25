import React from "react";
import { compose } from "recompose";
import { ResetPasswordForm } from "../ResetPassword";
import ChangePasswordForm from "./ChangePassword";
import LoginManagement from "./LoginManagement";
import SignOutButton from "../../components/SignOutButton";
import { AuthUserContext, withPermissions } from "../../components/Session";

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
