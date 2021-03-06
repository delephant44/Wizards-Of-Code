import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";

const SignUpPage = props => (
  <div className="sign-in-page-container centerUp">
    <h1 className="sign-up-logo">Sign Up</h1>
    <SignUpForm login={props.login} />
  </div>
);

const INITIAL_STATE = {
  username: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  error: null,
  uid: null
};

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { username, email, passwordOne } = this.state;

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        this.setState({ uid: authUser.user.uid });

        // Create a user in your Firebase realtime database
        return this.props.firebase.user(authUser.user.uid).set({
          username,
          email,
          experience: 0,
          maxHealth: 100,
          activeBattle: "",
          imgUrl:
            "https://firebasestorage.googleapis.com/v0/b/wizards-of-code.appspot.com/o/mage_2%20copy.png?alt=media&token=b9f14ef3-a649-453d-bf5f-3449758fecf7"
        });
      })
      .then(() => {
        this.props.login(this.state.uid);
      })
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.PROFILE);
      })
      .catch(error => {
        this.setState({ error });
      });
    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { username, email, passwordOne, passwordTwo, error } = this.state;

    const isInvalid = // make stronger form validations here & make sure password isn't less than 6 characters
      passwordOne !== passwordTwo ||
      passwordOne === "" ||
      email === "" ||
      username === "";

    return (
      <div>
        <form onSubmit={this.onSubmit} className="sign-up-form">
          <input
            name="username"
            value={username}
            onChange={this.onChange}
            type="text"
            placeholder="Full Name"
            className="input-fields"
          />

          <input
            name="email"
            value={email}
            onChange={this.onChange}
            type="text"
            placeholder="Email Address"
            className="input-fields"
          />

          <input
            name="passwordOne"
            value={passwordOne}
            onChange={this.onChange}
            type="password"
            placeholder="Password"
            className="input-fields"
          />

          <input
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.onChange}
            type="password"
            placeholder="Confirm Password"
            className="input-fields"
          />

          <button disabled={isInvalid} type="submit" className="sign-up-btn">
            Sign Up
          </button>
          {error && <p>{error.message}</p>}
        </form>
      </div>
    );
  }
}
const SignUpLink = () => (
  <p className="no-account">
    Don't have an account?{" "}
    <Link to={ROUTES.SIGN_UP} className="sp-link">
      Sign Up
    </Link>
  </p>
);

const SignUpForm = compose(
  withRouter,
  withFirebase
)(SignUpFormBase);

export default SignUpPage;
export { SignUpForm, SignUpLink };
