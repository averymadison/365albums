import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import './app.css';
import * as ROUTES from './constants/routes';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Account from './pages/Account';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Navigation />
      <Route exact path={ROUTES.LANDING} component={Landing} />
      <Route path={ROUTES.HOME} component={Home} />
      <Route path={ROUTES.ACCOUNT} component={Account} />
      <Route path={ROUTES.ADMIN} component={Admin} />
    </Router>
  );
}

export default App;
