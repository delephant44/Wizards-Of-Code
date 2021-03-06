import React from "react";
import { Link } from "react-router-dom";
import Animation from "./utilities";

export default function GameOver(props) {
  return (
    <div className="game-over">
      {props.user.username === props.battleInfo.winner ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundImage:
              "url(https://firebasestorage.googleapis.com/v0/b/wizards-of-code.appspot.com/o/dd4c80ed483c8f3c286cd44194f2e93b.jpg?alt=media&token=947c1ec2-63f2-4d98-849c-a48a111495ab)",
            height: "100%",
            backgroundSize: "cover",
            overflowY: "auto",
            alignContent: "center",
            justifyContent: "space-Evenly"
          }}
        >
          <div className="winOrLose">
            <h1 className="lose-win">Congratulations</h1>
            <h1 className="lose-win">YOU WIN</h1>
          </div>
          {props.battleInfo.player1 === props.battleInfo.winner ? (
            <div
              className={`${Animation[props.battleInfo.player1_char].win} center`}
            >
              {" "}
            </div>
          ) : (
            <div
              className={`${Animation[props.battleInfo.player2_char].win} center`}
            >
              {" "}
            </div>
          )}

          <Link to={"/home"}>
            <button
              className="btn-back"
              onClick={props.battleInfo.isPractice ? "" : props.addExp}
            >
              Play Again
            </button>
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundImage:
              "url(https://firebasestorage.googleapis.com/v0/b/wizards-of-code.appspot.com/o/2943378-fantasy-art-artwork-forest___landscape-nature-wallpapers.jpg?alt=media&token=9af2b2b5-a818-4d56-9941-4b7a294ad241)",
            height: "100%",
            backgroundSize: "cover",
            overflowY: "auto",
            alignContent: "center",
            justifyContent: "space-Evenly"
          }}
        >
          <div className="winOrLose">
            <h1 className="lose-win">YOU LOSE...</h1>
            <h1 className="lose-win">
              The winner is {props.battleInfo.winner}
            </h1>
          </div>

          <div className="center">
            <img
              className="grave"
              src="https://firebasestorage.googleapis.com/v0/b/wizards-of-code.appspot.com/o/galadriel-die.png?alt=media&token=9658752a-ec5f-40f3-adcf-642f5a0d5d24"
              alt=""
            />

            <Link to={"/home"}>
              <button className="btn-back">Play Again</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
