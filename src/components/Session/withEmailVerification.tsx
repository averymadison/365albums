import React from 'react';
import AuthUserContext from './context';
import Firebase, { withFirebase } from '../Firebase';

interface Props {
  firebase: Firebase;
}

interface State {
  isSent: boolean;
}

const needsEmailVerification = (authUser: any) =>
  authUser &&
  !authUser.emailVerified &&
  authUser.providerData
    .map((provider: any) => provider.providerId)
    .includes('password');

const withEmailVerification = (Component: any) => {
  class WithEmailVerification extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = { isSent: false };
    }

    onSendEmailVerification = () => {
      this.props.firebase
        .doSendEmailVerification()!
        .then(() => this.setState({ isSent: true }));
    };

    render() {
      return (
        <AuthUserContext.Consumer>
          {authUser =>
            needsEmailVerification(authUser) ? (
              <div>
                {this.state.isSent ? (
                  <p>Email confirmation sent</p>
                ) : (
                  <p>Verify your email</p>
                )}
                <button
                  type="button"
                  onClick={this.onSendEmailVerification}
                  disabled={this.state.isSent}
                >
                  Send Confirmation Email
                </button>
              </div>
            ) : (
              <Component {...this.props} />
            )
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withFirebase(WithEmailVerification);
};

export default withEmailVerification;
