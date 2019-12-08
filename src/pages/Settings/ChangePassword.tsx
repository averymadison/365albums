import React from 'react';
import Firebase, { withFirebase } from '../../components/Firebase';

interface Props {
  firebase: Firebase;
}

interface State {
  passwordOne: string;
  passwordTwo: string;
  error: firebase.auth.AuthError | null;
}

const INITIAL_STATE = {
  passwordOne: '',
  passwordTwo: '',
  error: null
};

class ChangePasswordForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event: React.MouseEvent<HTMLFormElement>) => {
    const { passwordOne } = this.state;

    this.props.firebase
      .doPasswordUpdate(passwordOne)!
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
    const { passwordOne, passwordTwo, error } = this.state;

    const isInvalid = passwordOne !== passwordTwo || passwordOne === '';

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="New Password"
        />
        <input
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm New Password"
        />
        <button disabled={isInvalid} type="submit">
          Change Password
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

export default withFirebase(ChangePasswordForm);
