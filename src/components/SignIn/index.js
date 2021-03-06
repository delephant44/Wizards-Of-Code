import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { SignUpLink } from "../SignUp";
import { PasswordForgetLink } from "../PasswordForget";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";

const SignInPage = props => (
  <div className="sign-in-page-container centerUp">
    <h1 className="sign-up-logo">Sign In</h1>
    <SignInForm login={props.login} />

    <PasswordForgetLink />
    <SignUpLink />
  </div>
);

const INITIAL_STATE = {
  email: "",
  password: "",
  error: null
};

class SignInFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { email, password } = this.state;
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(authUser => {
        this.props.login(authUser.user.uid);
      })
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.PROFILE);
      })
      .catch(error => {
        this.setState({ error });
      });
    event.preventDefault(); // surprised this works with this at the bottom? 🤔
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, password, error } = this.state;
    const isInvalid = password === "" || email === "";

    return (
      <div className="sign-in">
        <form onSubmit={this.onSubmit} className="sign-up-form">
          <input
            name="email"
            value={email}
            onChange={this.onChange}
            type="text"
            placeholder="Email Address"
            className="input-fields"
          />
          <input
            name="password"
            value={password}
            onChange={this.onChange}
            type="password"
            placeholder="Password"
            className="input-fields"
          />
          <button disabled={isInvalid} type="submit" className="sign-up-btn">
            Sign In
          </button>

          {error && <p className="error">{error.message}</p>}
        </form>
        <div className="sign-up-form">
          <button
            className="sign-up-btn"
            onClick={() => {
              this.props.firebase
                .doSignInWithGoogle()
                .then(() => this.props.history.push(ROUTES.PROFILE));
            }}
          >
            Sign In With Google
          </button>
        </div>
      </div>
    );
  }
}

const SignInForm = compose(
  withRouter,
  withFirebase
)(SignInFormBase);

export default SignInPage;
export { SignInForm };
