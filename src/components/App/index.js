import React from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Navigation from "../Navigation";
import GameStage from "../gamestage";
import LandingPage from "../Landing";
import SignUpPage from "../SignUp";
import SignInPage from "../SignIn";
import PasswordForgetPage from "../PasswordForget";
import HomePage from "../Home";
import AccountPage from "../Account";
import AdminPage from "../Admin";
import GameOver from "../GameOver";
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
      result: {},
      battleRef: {},
      userRef: {},
      endBattleSubscription: {}
    };
  }

  login = userId => {
    let userRef = this.props.firebase.user(userId);
    this.setState({ userRef });

    userRef.get().then(user => {
      const userData= user.data();
      this.setState({ user: userData })
      if (userData.activeBattle !== '') {
        let battleRef = this.props.firebase.battle(userData.activeBattle);
        this.setBattleState(battleRef);
      }
    });

    userRef.onSnapshot(snapshot => {
      this.setState({ user: snapshot.data() });
    });
  };

  setBattleState = (battleRef) => {
    let endBattleSubscription = battleRef.onSnapshot(querySnapshot => {
      this.setState({ myBattle: querySnapshot.data(), battleRef }, this.damageDealt);
    });
    this.setState( { endBattleSubscription });
  }

  damageDealt = () => {

    if (this.state.myBattle.user1_health > 0 && this.state.myBattle.user2_health > 0) {
      return;
    }

    if (this.state.myBattle.status === 'closed') {
      let [winner, loser] = this.state.user1_health <= 0 ? ['user2', 'user1'] : ['user1', 'user2'];
      console.log(`${loser} died!!!!!!`);

      this.state.battleRef.set({
        status: 'completed',
        winner
      },
      { merge: true }
      );

      this.state.endBattleSubscription()

      this.state.userRef.set({
        activeBattle: ''
      },
      { merge: true}
      );

      this.setState({ battleRef: {} });

      return <Redirect to={ROUTES.GAMEOVER} />

    }
  }

  getProblem = problemId => {
    const problemRef = this.props.firebase.problem(problemId);
    problemRef
      .get()
      .then(problem => this.setState({ problem: problem.data() }));
  };

  getOpenBattles = () => {
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
  };

  createBattle = () => {
    this.props.firebase.createBattle(this.state.user).then(battleRef => {
      this.setBattleState(battleRef);
      this.state.userRef.set({
        activeBattle: battleRef.id
      },
      { merge: true }
      )
    });
  };

  joinRandomBattle = () => {
    this.props.firebase.joinRandomBattle(this.state.user).then(battleRef => {
      console.log(battleRef.id);
      this.joinBattle(battleRef);
    });
  };

  joinOpenBattle = battleId => {
    let battleRef = this.props.firebase.battle(battleId);
    this.joinBattle(battleRef);
  };

  joinBattle = battleRef => {
    const user = this.state.user;
    console.log(user);
    battleRef.set(
      {
        user2: user.username,
        user2_health: user.maxHealth,
        status: "closed"
      },
      { merge: true }
    );
    this.setBattleState(battleRef);
    this.state.userRef.set({
      activeBattle: battleRef.id
    },
    { merge: true }
    )
  };

  doDamage = amount => {
    if (this.state.user.username === this.state.myBattle.user1) {
      this.state.battleRef.set(
        {
          user2_health: this.state.myBattle.user2_health - amount
        },
        { merge: true }
      );
    } else {
      this.state.battleRef.set(
        {
          user1_health: this.state.myBattle.user1_health - amount
        },
        { merge: true }
      );
    }
  };

  getRandomProblem = difficulty => {
    this.props.firebase
      .getRandomProblem(difficulty)
      .then(problemRef => problemRef.get())
      .then(doc => this.setState({ problem: doc.data() }));

    // this.setState({ problem: probRef.data() });
  };

  updateCode = event => {
    this.setState({
      userCode: event
    });
  };

  submitCode = (code, inputs, expectedOutputs) => {
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
      if (event.data.correct) {
        this.doDamage(10);
      }
      webWorker.terminate();
      clearTimeout(timeoutId);
    };
  };

  componentDidMount() {
    this.props.firebase.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.login(authUser.uid);
      }
    });
  }

  render() {

    console.log(this.state);

    return (
      <Router>
        <div className="container">
          <Navigation />
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
                joinOpenBattle={this.joinOpenBattle}
                activeBattle={this.state.user.activeBattle}
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
                myBattle={this.state.myBattle}
                problem={this.state.problem}
                getProblem={this.getProblem}
                userCode={this.state.userCode}
                updateCode={this.updateCode}
                result={this.state.result}
                submitCode={this.submitCode}
                doDamage={this.doDamage}
                getRandomProblem={this.getRandomProblem}
                activeBattle={this.state.user.activeBattle}
              />
            )}
          />
          <Route
            path={ROUTES.GAMEOVER}
            render={props => (
              <GameOver
                {...props}
                battleInfo ={this.props.myBattle}
              />
            )}
          />
        </div>
      </Router>
    );
  }
}

export default withAuthentication(App);
