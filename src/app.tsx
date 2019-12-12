import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Header from './components/Header';
import './app.css';
import * as ROUTES from './constants/routes';
import {
  Landing,
  Home,
  Admin,
  SignIn,
  SignUp,
  ResetPassword,
  Settings
} from './pages';
import { withAuthentication } from './components/Session';

const App = () => (
  <Router>
    <div className="app">
      <Header />
      <div className="app-content">
        <Route exact path={ROUTES.LANDING} component={Landing} />
        <Route path={ROUTES.HOME} component={Home} />
        <Route path={ROUTES.ADMIN} component={Admin} />
        <Route path={ROUTES.SETTINGS} component={Settings} />
        <Route path={ROUTES.SIGN_IN} component={SignIn} />
        <Route path={ROUTES.SIGN_UP} component={SignUp} />
        <Route path={ROUTES.RESET_PASSWORD} component={ResetPassword} />
      </div>
    </div>
  </Router>
);

export default withAuthentication(App);
