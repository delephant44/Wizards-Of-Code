import React from 'react'
import CodeArea from './codeArea'
import Instructions from './instructions'
import Result from './result'
import Player1 from './player1'
import Player2 from './player2'
import Attacking from './attacking'
import {withFirebase} from '../Firebase'
import GameOver from './gameOver'
import firebutton from '../../styling/easy-fireball-button.png'
import easyButton from '../../styling/easy-button.png'
import mediumButton from '../../styling/medium-button.png'
import hardButton from '../../styling/hard-button.png'
import Animation from './utilities'
import MessageLog from './messageLog'
import easySpell from '../../styling/easy-spell.png'
import mediumSpell from '../../styling/medium-spell.png'
import hardSpell from '../../styling/hard-spell.png'

class GameStage extends React.Component {
  constructor(props) {
    super(props)
    this.unsubscribe = {}
    this.taskboxClass = 'taskbox'
    this.state = {
      battleIsOver: false,
      battleInfo: {},
      problem: {
        prompt: ''
      },
      result: {},
      userCode: '',
      backgroundImage: '',
      message: {}
    }
  }

  getProblem = problemId => {
    const problemRef = this.props.firebase.problem(problemId)
    problemRef.get().then(problem => this.setState({problem: problem.data()}))
  }

  getRandomProblem = difficulty => {
    this.setState({result: {}})
    this.props.firebase
      .getRandomProblem(difficulty)
      .then(problemRef => problemRef.get())
      .then(doc => {
        const problem = doc.data()
        this.setState({problem, userCode: `${problem.startingCode}\n  \n}`})
      })
  }

  updateCode = event => {
    this.setState({
      userCode: event
    })
  }

  submitCode = (code, inputs, expectedOutputs) => {
    const webWorker = new Worker('webWorker.js')

    // send user code to web worker with relevant data
    webWorker.postMessage({
      userFunction: code,
      inputs: inputs,
      expectedOutputs: expectedOutputs
    })

    // timeout to protect against infinite loops etc.
    const timeoutId = setTimeout(() => {
      this.setState({
        result: {userOutputs: 'Your function failed!  :(', correct: false}
      })
      webWorker.terminate()
      this.selfDamage(5)
    }, 5000)

    // Damage amounts: Move to database?
    const damageAmounts = {
      1: 10,
      2: 25,
      3: 60
    }

    // respond to correct/incorrect evaluations of code from WebWorker
    webWorker.onmessage = event => {
      this.setState({result: event.data})
      if (event.data.correct) {
        this.doDamage(damageAmounts[this.state.problem.difficulty])
        this.setState({
          userCode: '',
          problem: {prompt: ''},
          message: {content: 'Success!', type: 'goodMessage'}
        })
      } else {
        this.selfDamage(this.state.problem.difficulty * 5)
        this.setState({
          message: {content: 'Incorrect', type: 'badMessage'}
        })
      }
      webWorker.terminate()
      clearTimeout(timeoutId)
    }
  }

  updateHealth = (amount, player) => {
    const updateObject = {
      player1: {
        player2_health: this.props.firebase.db._firebaseApp.firebase_.firestore.FieldValue.increment(
          -1 * amount
        ),
        player1_anim: Animation[this.state.battleInfo.player1_char].attack,
        player2_anim: Animation[this.state.battleInfo.player2_char].hurt,
        attack_anim: Animation.spell.player1.purpleExplosion
      },
      player2: {
        player1_health: this.props.firebase.db._firebaseApp.firebase_.firestore.FieldValue.increment(
          -1 * amount
        ),
        player2_anim: Animation[this.state.battleInfo.player2_char].attack,
        player1_anim: Animation[this.state.battleInfo.player1_char].hurt,
        attack_anim: Animation.spell.player2.purpleExplosion
      }
    }

    this.props.battleRef.update(updateObject[player]).then(() => {
      this.isDead()
    })
  }

  doDamage = amount => {
    this.updateHealth(amount, this.props.user.role)

    // return to idle animations
    setTimeout(() => {
      this.props.battleRef.set(
        {
          player1_anim: Animation[this.state.battleInfo.player1_char].idle,
          player2_anim: Animation[this.state.battleInfo.player2_char].idle,
          attack_anim: null
        },
        {merge: true}
      )
      this.setState({message: {}})
    }, 2000)
  }

  selfDamage = amount => {
    this.taskboxClass = 'taskbox red'
    if (this.props.user.role === 'player2') {
      this.props.battleRef
        .update({
          player2_health: this.props.firebase.db._firebaseApp.firebase_.firestore.FieldValue.increment(
            -1 * amount
          ),
          player2_anim: Animation[this.state.battleInfo.player2_char].spin
        })
        .then(() => {
          this.isDead()
        })
    } else {
      this.props.battleRef
        .update({
          player1_health: this.props.firebase.db._firebaseApp.firebase_.firestore.FieldValue.increment(
            -1 * amount
          ),
          player1_anim: Animation[this.state.battleInfo.player1_char].spin
        })
        .then(() => {
          this.isDead()
        })
    }
    setTimeout(() => {
      this.props.battleRef.set(
        {
          player1_anim: Animation[this.state.battleInfo.player1_char].idle,
          player2_anim: Animation[this.state.battleInfo.player2_char].idle,
          attack_anim: null
        },
        {merge: true}
      )
      this.taskboxClass = 'taskbox'
      this.setState({message: {}})
    }, 2000)
  }

  addExp = () => {
    this.props.userRef.set(
      {experience: (this.props.user.experience += 100)},
      {merge: true}
    )
    if (this.props.user.experience >= 2000) {
      this.props.userRef.set(
        {
          maxHealth: (this.props.user.maxHealth += 20)
        },
        {merge: true}
      )
    } else if (this.props.user.experience >= 4000) {
      this.props.userRef.set(
        {
          maxHealth: (this.props.user.maxHealth += 20)
        },
        {merge: true}
      )
    } else if (this.props.user.experience >= 6000) {
      this.props.userRef.set(
        {
          maxHealth: (this.props.user.maxHealth += 20)
        },
        {merge: true}
      )
    } else if (this.props.user.experience >= 8000) {
      this.props.userRef.set(
        {
          maxHealth: (this.props.user.maxHealth += 20)
        },
        {merge: true}
      )
    } else if (this.props.user.experience >= 10000) {
      this.props.userRef.set(
        {
          maxHealth: (this.props.user.maxHealth += 20)
        },
        {merge: true}
      )
    }
  }

  isDead = () => {
    const {battleInfo} = this.state

    if (battleInfo.player1_health <= 0) {
      this.props.battleRef.set(
        {winner: battleInfo.player2, status: 'completed'},
        {merge: true}
      )
    } else if (battleInfo.player2_health <= 0) {
      this.props.battleRef.set(
        {winner: battleInfo.player1, status: 'completed'},
        {merge: true}
      )
    }
  }

  onBattleUpdate = battleSnapshot => {
    this.setState({battleInfo: battleSnapshot.data()})
  }

  componentDidMount() {
    if (this.props.battleRef.id) {
      this.unsubscribe = this.props.battleRef.onSnapshot(this.onBattleUpdate)
      this.props.battleRef
        .get()
        .then(battleDoc =>
          this.setState({backgroundImage: battleDoc.data().background})
        )
    }
  }

  componentWillUnmount() {
    this.unsubscribe()
    if (this.state.battleInfo.status === 'completed') {
      this.props.userRef.set(
        {
          activeBattle: ''
        },
        {merge: true}
      )
    }
  }

  render() {
    if (this.state.battleInfo.status === 'completed') {
      console.log('Battle Devided', this.state)
      return (
        <GameOver
          battleInfo={this.state.battleInfo}
          user={this.props.user}
          addExp={this.addExp}
        />
      )
    }

    return (
      <div className="gamepage">
        <div
          className="gamestage"
          style={{
            backgroundImage: `url(${this.state.backgroundImage})`
          }}
        >
          <div style={{transform: 'scale(0.2)'}}>
            {this.state.battleInfo.player1 ? (
              <div>
                <img
                  src={easySpell}
                  alt="easy-Spell"
                  onClick={() => this.getRandomProblem(1)}
                ></img>
                <img
                  src={mediumSpell}
                  alt="medium-Spell"
                  onClick={() => this.getRandomProblem(2)}
                ></img>
                <img
                  src={hardSpell}
                  alt="medium-Spell"
                  onClick={() => this.getRandomProblem(3)}
                ></img>
              </div>
            ) : (
              <img
                src={firebutton}
                onClick={() => this.getRandomProblem(1)}
                alt="fireball!!!!" //what is alt for?
              />
            )}
          </div>
          <div className="gamebox">
            <MessageLog message={this.state.message} />
            <div className={this.state.battleInfo.attack_anim}>
              <Attacking />
            </div>
            <div className="player">
              <Player1
                playerName={this.state.battleInfo.player1}
                playerHP={this.state.battleInfo.player1_health}
              />
              <div
                className={this.state.battleInfo.player1_anim}
                style={convertDirection}
              ></div>
            </div>
            <div className="player">
              <Player2
                playerName={this.state.battleInfo.player2}
                playerHP={this.state.battleInfo.player2_health}
              />
              <div className={this.state.battleInfo.player2_anim}></div>
            </div>
          </div>
          <div style={{transform: 'scale(0.2)'}}>
            {this.state.battleInfo.player2 ? (
              <div>
                <img
                  src={easyButton}
                  alt="easy-Button"
                  onClick={() => this.getRandomProblem(1)}
                ></img>
                <img
                  src={mediumButton}
                  alt="medium-Button"
                  onClick={() => this.getRandomProblem(2)}
                ></img>
                <img
                  src={hardButton}
                  alt="medium-Button"
                  onClick={() => this.getRandomProblem(3)}
                ></img>
              </div>
            ) : (
              <img
                src={firebutton}
                onClick={() => this.getRandomProblem(1)}
                alt="fireball!!!!" //what is alt for?
              />
            )}
          </div>
        </div>
        <div className={this.taskboxClass}>
          <Instructions
            prompt={this.state.problem.prompt}
            doDamage={this.doDamage}
            getRandomProblem={this.getRandomProblem}
          />
          <CodeArea value={this.state.userCode} updateCode={this.updateCode} />
          <Result
            submitCode={
              this.state.problem.inputs
                ? this.submitCode
                : () => console.log('No opponent')
            }
            userCode={this.state.userCode}
            problem={this.state.problem}
            result={this.state.result}
          />
        </div>
      </div>
    )
  }
}

export default withFirebase(GameStage)

const fireball = 'glow-fireball'
const none = {transform: 'none'}

// add style={glowAnimation} to fireball class when fireball button can be pressed
const glowAnimation = {animation: 'glowing 1500ms infinite'}

// all players are animated to be player 2 (facing left), if we were to make them player1, we would have to convert their facing direction, that's why we add style={convertDirection} in Player1 div
const convertDirection = {
  transform: 'scaleX(-0.7) scaleY(0.7)'
}
