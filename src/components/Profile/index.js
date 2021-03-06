import React from "react";
import { withAuthorization } from "../Session";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import Medals from './medals'
import { BATTLE, ACCOUNT, BATTLEHISTORY } from "../../constants/routes";

const ProfilePage = props => {
  return (
    <div className="profile-page-container">
      <div className="home-page-navbar">
        <div className="home-page-navbar-container">
          <h1 className="sign-up-logo">Profile Page</h1>
          <Link to={BATTLEHISTORY}>
            <div className="user-history">
              <button
                className="user-history-btn"
                onMouseDown={props.pageSound}
              >
                Battle History
              </button>
            </div>
          </Link>
          <div className="go-battle">
            <Link to={BATTLE}>
              <button className="go-to-battle" onMouseDown={props.pageSound}>
                Go To Battle
              </button>
            </Link>
          </div>
          <div className="go-battle">
            <Link to={ACCOUNT}>
              <button className="go-to-battle" onMouseDown={props.pageSound}>
                Account Settings
              </button>
            </Link>
          </div>
          <div className="medals-container">
            <Medals
              getMedals={props.getMedals}
              medals={props.medals}
              user={props.user}
            />
          </div>
        </div>
      </div>
      <div className="profile-info">
        <div className="profile-info-container">
          <img src={props.user.imgUrl} alt="wizard" className="profile-pic" />
          <Link to={'/avatars'}>
            <button
              className="change-profile-pic"
              onMouseDown={props.pageSound}
            >
              Change Profile Picture
            </button>
          </Link>
          <div className="user-stats">
            {/* <h1>Stats</h1> */}
            <h3>Name: {props.user.username}</h3>
            <h3>Email: {props.user.email}</h3>
            <h3>Experience: {props.user.experience}</h3>
            <h3>Health: {props.user.maxHealth}HP</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

const condition = authUser => !!authUser;
export default compose(withAuthorization(condition))(ProfilePage);
