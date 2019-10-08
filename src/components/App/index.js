import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Navigation from "../Navigation";
import GameStage from "../gamestage";
import LandingPage from "../Landing";
import SignUpPage from "../SignUp";
import SignInPage from "../SignIn";
import PasswordForgetPage from "../PasswordForget";
import HomePage from "../Home";
import AccountPage from "../Account";
import AdminPage from "../Admin";
import * as ROUTES from "../../constants/routes";
import { withAuthentication } from "../Session";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      battles: [],
      myBattle: {},
      problems: [],
      problem: [],
      skills: [],
      userCode: "",
      result: {}
    };
    this.login = this.login.bind(this);
    this.getProblem = this.getProblem.bind(this);
    this.updateCode = this.updateCode.bind(this);
    this.submitCode = this.submitCode.bind(this);
    this.getOpenBattles = this.getOpenBattles.bind(this);
    this.createBattle = this.createBattle.bind(this);
    this.joinRandomBattle = this.joinRandomBattle.bind(this);
  }

  login(userId) {
    let userRef = this.props.firebase.user(userId);
    userRef.get().then(user => this.setState({ user: user.data() }));
    userRef.onSnapshot(snapshot => {
      console.log("SNAPSHOT", snapshot);
    });
  }
  getProblem(problemId) {
    const problemRef = this.props.firebase.problem(problemId);
    problemRef
      .get()
      .then(problem => this.setState({ problem: problem.data() }));
  }

  getOpenBattles() {
    const openBattlesRef = this.props.firebase.openBattles();
    let allOpenBattles = [];
    openBattlesRef.onSnapshot(querySnapshot => {
      querySnapshot.docChanges().forEach(change => {
        let status = change.doc.data().status;
        let doc = change.doc.data();
        let id = change.doc.id;
        if (change.type === "added") {
          if (status === "open") {
            allOpenBattles.push({ ...doc, id });
          }
        } else if (change.type === "modified") {
          if (status === "closed") {
            allOpenBattles = allOpenBattles.filter(battle => battle.id !== id);
          }
        }
      });
      this.setState({ battles: allOpenBattles });
    });
  }

  createBattle() {
    this.props.firebase.createBattle(this.state.user).then(battleRef =>
      battleRef.onSnapshot(querySnapshot => {
        this.setState({ myBattle: querySnapshot });
      })
    );
  }
  joinRandomBattle() {
    const user = this.state.user;
    this.props.firebase.joinRandomBattle(this.state.user).then(doc => {
      console.log(doc.id);
      doc.set(
        {
          user2: user.username,
          user2_health: user.maxHealth,
          status: "closed"
        },
        { merge: true }
      );
      doc.onSnapshot(querySnapshot => {
        this.setState({ myBattle: querySnapshot });
      });
    });
  }

  updateCode = function(event) {
    this.setState({
      userCode: event
    });
  };

  submitCode = function(code, inputs, expectedOutputs) {
    const webWorker = new Worker("webWorker.js");

    webWorker.postMessage({
      userFunction: code,
      inputs: inputs,
      expectedOutputs: expectedOutputs
    });

    const timeoutId = setTimeout(() => {
      this.setState({
        result: { userOutputs: "Your function failed!  :(", correct: false }
      });
      webWorker.terminate();
    }, 5000);

    webWorker.onmessage = event => {
      this.setState({ result: event.data });
      webWorker.terminate();
      clearTimeout(timeoutId);
    };
  };

  componentDidMount () {
    this.props.firebase.auth.onAuthStateChanged(authUser => {
      console.log(authUser);
      if (authUser) {
        this.login(authUser.uid);
      }
    });
  }




  render() {

    return (
      <Router>
        <div className="container">
          <Navigation />
          <hr />
          <Route
            exact
            path={ROUTES.LANDING}
            render={props => (
              <LandingPage
                {...props}
                createBattle={this.createBattle}
                openBattles={this.state.battles}
                getOpenBattles={this.getOpenBattles}
                joinRandomBattle={this.joinRandomBattle}
              />
            )}
          />
          <Route
            path={ROUTES.SIGN_UP}
            render={props => <SignUpPage {...props} login={this.login} />}
          />
          <Route
            path={ROUTES.SIGN_IN}
            render={props => <SignInPage {...props} login={this.login} />}
          />
          <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
          <Route
            path={ROUTES.HOME}
            render={props => <HomePage {...props} user={this.state.user} />}
          />
          <Route path={ROUTES.ACCOUNT} component={AccountPage} />
          <Route path={ROUTES.ADMIN} component={AdminPage} />
          <Route
            path={ROUTES.GAMESTAGE}
            render={props => (
              <GameStage
                {...props}
                problem={this.state.problem}
                getProblem={this.getProblem}
                userCode={this.state.userCode}
                updateCode={this.updateCode}
                result={this.state.result}
                submitCode={this.submitCode}
              />
            )}
          />
        </div>
      </Router>
    );
  }
}

export default withAuthentication(App);
