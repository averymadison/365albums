import React from 'react';
import { withFirebase } from '../Firebase';
import { AuthUserContext } from '../Session';

interface Props {
  firebase: any;
}

interface State {
  authUser: any;
}

const withAuthentication = (Component: any) => {
  class WithAuthentication extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);

      this.state = {
        authUser: null
      };
    }

    componentDidMount() {
      this.props.firebase.auth.onAuthStateChanged((authUser: any) => {
        authUser
          ? this.setState({ authUser })
          : this.setState({ authUser: null });
      });
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
