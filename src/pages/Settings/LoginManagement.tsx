import React from 'react';
import Firebase, { withFirebase } from '../../components/Firebase';
import DefaultLoginToggle from './DefaultLoginToggle';
import SocialLoginToggle from './SocialLoginToggle';

interface Props {
  firebase: Firebase;
  authUser: any;
}

interface State {
  activeSignInMethods: string[];
  error: firebase.auth.AuthError | null;
  isLoading: boolean;
}

const SIGN_IN_METHODS = [
  {
    id: 'password',
    provider: null
  },
  {
    id: 'google.com',
    provider: 'googleProvider'
  }
];

class LoginManagementBase extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      activeSignInMethods: [],
      error: null,
      isLoading: true
    };
  }

  componentDidMount() {
    this.fetchSignInMethods();
  }

  fetchSignInMethods = () => {
    this.props.firebase.auth
      .fetchSignInMethodsForEmail(this.props.authUser.email)
      .then((activeSignInMethods: string[]) =>
        this.setState({ activeSignInMethods, error: null, isLoading: false })
      )
      .catch((error: firebase.auth.AuthError) => this.setState({ error }));
  };

  onSocialLoginLink = () => {
    this.props.firebase.auth
      .currentUser!.linkWithPopup(this.props.firebase.googleProvider)
      .then(this.fetchSignInMethods)
      .catch((error: firebase.auth.AuthError) => this.setState({ error }));
  };

  onUnlink = (providerId: string) => {
    this.props.firebase.auth
      .currentUser!.unlink(providerId)
      .then(this.fetchSignInMethods)
      .catch((error: firebase.auth.AuthError) => this.setState({ error }));
  };

  onDefaultLoginLink = (password: string) => {
    const credential = this.props.firebase.emailAuthProvider.credential(
      this.props.authUser.email,
      password
    );

    this.props.firebase.auth
      .currentUser!.linkAndRetrieveDataWithCredential(credential)
      .then(this.fetchSignInMethods)
      .catch((error: firebase.auth.AuthError) => this.setState({ error }));
  };

  render() {
    const { activeSignInMethods, error, isLoading } = this.state;

    return (
      !isLoading && (
        <div>
          Sign In Methods:
          <ul>
            {SIGN_IN_METHODS.map(signInMethod => {
              const onlyOneLeft = activeSignInMethods.length === 1;
              const isEnabled = activeSignInMethods.includes(signInMethod.id);

              return (
                <li key={signInMethod.id}>
                  {signInMethod.id === 'password' ? (
                    <DefaultLoginToggle
                      onlyOneLeft={onlyOneLeft}
                      isEnabled={isEnabled}
                      signInMethod={signInMethod}
                      onLink={this.onDefaultLoginLink}
                      onUnlink={this.onUnlink}
                    />
                  ) : (
                    <SocialLoginToggle
                      onlyOneLeft={onlyOneLeft}
                      isEnabled={isEnabled}
                      signInMethod={signInMethod}
                      onLink={this.onSocialLoginLink}
                      onUnlink={this.onUnlink}
                    />
                  )}
                </li>
              );
            })}
          </ul>
          {error && <p>{error.message}</p>}
        </div>
      )
    );
  }
}

const LoginManagement = withFirebase(LoginManagementBase);

export default LoginManagement;
