import React from 'react';
import { Link } from 'react-router-dom';

export default function GameOver(props) {
  console.log(props)
  return (
    <div className="game-over">
      {props.user.username === props.battleInfo.winner ? (
        <div>
          <img
            className="sign-up-img"
            src="https://firebasestorage.googleapis.com/v0/b/wizards-of-code.appspot.com/o/dd4c80ed483c8f3c286cd44194f2e93b.jpg?alt=media&token=b445f3c9-2313-40a9-86bc-221e1ad0e232"
            alt=""
          />
          <h1 className="lose-win">Congratulations</h1>
          <h1 className="lose-win">YOU WIN</h1>

          <Link to={'/home'}>
            <button className="sign-up-btn">Play Again</button>
          </Link>
        </div>
      ) : (
        <div>
          <div>
            <img
              className="sign-up-img"
              src="https://firebasestorage.googleapis.com/v0/b/wizards-of-code.appspot.com/o/2943378-fantasy-art-artwork-forest___landscape-nature-wallpapers.jpg?alt=media&token=9af2b2b5-a818-4d56-9941-4b7a294ad241"
              alt=""
            />
            <h1 className="lose-win">YOU LOSE...</h1>
            <h1 className="lose-win">
              The winner is {props.battleInfo.winner}
            </h1>
            <img
            className="grave"
              src="https://firebasestorage.googleapis.com/v0/b/wizards-of-code.appspot.com/o/galadriel-die.png?alt=media&token=9658752a-ec5f-40f3-adcf-642f5a0d5d24"
              alt=""
            />
            <Link to={'/home'}>
              <button className="sign-up-btn">Play Again</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

