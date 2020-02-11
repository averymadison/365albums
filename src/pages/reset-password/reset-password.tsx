import * as ROUTES from '../../constants/routes';

import Firebase, { withFirebase } from '../../components/firebase';

import { Link } from 'react-router-dom';
import React from 'react';

const ResetPassword = () => (
  <div>
    <h1>Reset Password</h1>
    <ResetPasswordForm />
  </div>
);

interface Props {
  firebase: Firebase;
}

interface State {
  email: string;
  error: firebase.auth.AuthError | null;
}

const INITIAL_STATE = {
  email: '',
  error: null
};

class ResetPasswordFormBase extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event: React.MouseEvent<HTMLFormElement>) => {
    const { email } = this.state;

    this.props.firebase
      .doPasswordReset(email)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
      })
      .catch((error: firebase.auth.Error) => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [event.target.name]: event.target.value } as Pick<
      State,
      any
    >);
  };

  render() {
    const { email, error } = this.state;

    const isInvalid = email === '';

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
        <button className="button" disabled={isInvalid} type="submit">
          Reset Password
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const ResetPasswordLink = () => (
  <p>
    <Link to={ROUTES.RESET_PASSWORD}>Forgot Password?</Link>
  </p>
);

const ResetPasswordForm = withFirebase(ResetPasswordFormBase as any);

export default ResetPassword;

export { ResetPasswordForm, ResetPasswordLink };
