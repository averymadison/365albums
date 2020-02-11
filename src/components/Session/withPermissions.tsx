import * as ROUTES from '../../constants/routes';

import Firebase, { withFirebase } from '../firebase';

import AuthUserContext from './context';
import { History } from 'history';
import React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';

interface Props {
  firebase: Firebase;
  history: History;
}

const withPermissions = (condition: any) => (Component: any) => {
  class WithPermissions extends React.Component<Props> {
    componentDidMount() {
      this.props.firebase.onAuthUserListener(
        (authUser: any) => {
          if (!condition(authUser)) {
            this.props.history.push(ROUTES.SIGN_IN);
          }
        },
        () => this.props.history.push(ROUTES.SIGN_IN)
      );
    }

    render() {
      return (
        <AuthUserContext.Consumer>
          {authUser =>
            condition(authUser) ? <Component {...this.props} /> : null
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return compose(withRouter, withFirebase)(WithPermissions as any);
};

export default withPermissions;
