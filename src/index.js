import './index.css';

import * as serviceWorker from './serviceWorker';

import Firebase, { FirebaseContext } from './components/firebase';

import App from './app';
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <FirebaseContext.Provider value={new Firebase()}>
    <App />
  </FirebaseContext.Provider>,
  document.getElementById('root')
);

serviceWorker.register();
