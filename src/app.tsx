import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './app.css';
import * as ROUTES from './constants/routes';
import {
  Admin,
  Chart,
  Charts,
  Home,
  Landing,
  ResetPassword,
  Settings,
  SignIn,
  SignUp
} from './pages';
import Nav from './components/Nav';
import { withAuthentication } from './components/Session';

const App = () => (
  <Router>
    <div className="app">
      <Nav />
      <main className="app-content">
        <Route exact path={ROUTES.LANDING} component={Landing} />
        <Route path={ROUTES.HOME} component={Home} />
        <Route path={ROUTES.CHARTS} component={Charts} />
        <Route path={ROUTES.CHART} component={Chart} />
        <Route path={ROUTES.ADMIN} component={Admin} />
        <Route path={ROUTES.SETTINGS} component={Settings} />
        <Route path={ROUTES.SIGN_IN} component={SignIn} />
        <Route path={ROUTES.SIGN_UP} component={SignUp} />
        <Route path={ROUTES.RESET_PASSWORD} component={ResetPassword} />
      </main>
    </div>
  </Router>
);

export default withAuthentication(App);
