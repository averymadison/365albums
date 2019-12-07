import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';
import { History } from 'history';
import * as ROUTES from '../../constants/routes';
import AuthUserContext from './context';

interface Props {
  firebase: any;
  history: History;
}

const withPermissions = (condition: any) => (Component: any) => {
  class WithPermissions extends React.Component<Props> {
    componentDidMount() {
      this.props.firebase.auth.onAuthStateChanged((authUser: any) => {
        if (!condition(authUser)) {
          this.props.history.push(ROUTES.SIGN_IN);
        }
      });
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
