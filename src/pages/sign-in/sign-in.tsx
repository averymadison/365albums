import * as ROUTES from '../../constants/routes';

import Firebase, { withFirebase } from '../../components/firebase';

import { FaGoogle } from 'react-icons/fa';
import { History } from 'history';
import React from 'react';
import { ResetPasswordLink } from '../reset-password/reset-password';
import { SignUpLink } from '../sign-up/sign-up';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';

const SignIn = () => (
  <div className="sign-in-page">
    <div className="container">
      <h1>Sign In</h1>
      <div className="sign-in-form">
        <SignInForm />
        <SignInGoogle />
      </div>
      <ResetPasswordLink />
      <SignUpLink />
    </div>
  </div>
);

interface Props {
  firebase: Firebase;
  history: History;
}

interface SignInFormState {
  email: string;
  password: string;
  error: firebase.auth.AuthError | null;
}

interface GoogleFormState {
  error: firebase.auth.AuthError | null;
}

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null
};

class SignInFormBase extends React.Component<Props, SignInFormState> {
  constructor(props: Props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event: React.MouseEvent<HTMLFormElement>) => {
    const { email, password } = this.state;

    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch((error: firebase.auth.Error) => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [event.target.name]: event.target.value } as Pick<
      SignInFormState,
      any
    >);
  };

  render() {
    const { email, password, error } = this.state;

    const isInvalid = password === '' || email === '';

    return (
      <form onSubmit={this.onSubmit}>
        <input
          className="input"
          name="email"
          value={email}
          onChange={this.onChange}
          type="email"
          placeholder="Email Address"
        />
        <input
          className="input"
          name="password"
          value={password}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <button className="button" disabled={isInvalid} type="submit">
          Sign In
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

class SignInGoogleBase extends React.Component<Props, GoogleFormState> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  onSubmit = (event: React.MouseEvent<HTMLFormElement>) => {
    this.props.firebase
      .doSignInWithGoogle()
      .then((socialAuthUser: any) => {
        // Create a user in the Firebase realtime database
        return this.props.firebase.user(socialAuthUser.user.uid).update({
          username: socialAuthUser.user.displayName,
          email: socialAuthUser.user.email,
          roles: {}
        });
      })
      .then(() => {
        this.setState({ error: null });
        this.props.history.push(ROUTES.HOME);
      })
      .catch((error: firebase.auth.Error) => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  render() {
    const { error } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <button className="button" type="submit">
          <FaGoogle /> Sign In with Google
        </button>
        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const SignInForm = compose(withRouter, withFirebase)(SignInFormBase as any);

const SignInGoogle = compose(withRouter, withFirebase)(SignInGoogleBase as any);

export default SignIn;

export { SignInForm, SignInGoogle };
