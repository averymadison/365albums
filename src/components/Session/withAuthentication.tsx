import Firebase, { withFirebase } from '../firebase';

import { AuthUserContext } from '../session';
import React from 'react';

interface Props {
  firebase: Firebase;
}

interface State {
  authUser: any;
}

const withAuthentication = (Component: any) => {
  class WithAuthentication extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);

      this.state = {
        authUser: JSON.parse(localStorage.getItem('authUser') as string)
      };
    }

    componentDidMount() {
      this.props.firebase.onAuthUserListener(
        (authUser: any) => {
          localStorage.setItem('authUser', JSON.stringify(authUser));
          this.setState({ authUser });
        },
        () => {
          localStorage.removeItem('authUser');
          this.setState({ authUser: null });
        }
      );
    }

    render() {
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return withFirebase(WithAuthentication);
};

export default withAuthentication;
