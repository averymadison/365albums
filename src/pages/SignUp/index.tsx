import React from "react";
import { History } from "history";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";
import { SignInGoogle } from "../SignIn";
import * as ROUTES from "../../constants/routes";
import Firebase, { withFirebase } from "../../components/Firebase";

const SignUp = () => (
  <div className="sign-in-page">
    <div className="container">
      <h1>Sign Up</h1>
      <SignUpForm />
    </div>
  </div>
);

interface Props {
  firebase: Firebase;
  history: History;
}

interface State {
  name: string;
  email: string;
  passwordOne: string;
  passwordTwo: string;
  error: firebase.auth.AuthError | null;
}

const INITIAL_STATE = {
  name: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  error: null
};

class SignUpFormBase extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event: React.MouseEvent<HTMLFormElement>) => {
    const { name, email, passwordOne } = this.state;

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then((authUser: any) => {
        // Create a user in the Firebase realtime database
        return this.props.firebase.user(authUser.user.uid).set({ name, email });
      })
      .then(() => {
        return this.props.firebase.doSendEmailVerification();
      })
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch((error: firebase.auth.Error) => this.setState({ error }));

    event.preventDefault();
  };

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [event.target.name]: event.target.value } as Pick<
      State,
      any
    >);
  };

  onChangeCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [event.target.name]: event.target.checked } as Pick<
      State,
      any
    >);
  };

  render() {
    const { name, email, passwordOne, passwordTwo, error } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === "" ||
      email === "" ||
      name === "";

    return (
      <div className="sign-in-form">
        <form onSubmit={this.onSubmit}>
          <input
            className="input"
            name="name"
            value={name}
            onChange={this.onChange}
            type="text"
            placeholder="Name"
            maxLength={40}
          />
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
            name="passwordOne"
            value={passwordOne}
            onChange={this.onChange}
            type="password"
            placeholder="Password"
          />
          <input
            className="input"
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.onChange}
            type="password"
            placeholder="Confirm Password"
          />
          <button className="button" disabled={isInvalid} type="submit">
            Sign Up
          </button>

          {error && <p>{error.message}</p>}
        </form>
        <SignInGoogle />
      </div>
    );
  }
}

const SignUpLink = () => (
  <p>
    Don’t have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = compose(withRouter, withFirebase)(SignUpFormBase as any);

export default SignUp;

export { SignUpForm, SignUpLink };
