import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import * as Actions from '../actions/App';

export default class PlayAnimation extends Component {
  render() {
    return (
      <div
        className={classNames({
          'play-effect': true,
          'load': this.props.play.loading,
          'play': !this.props.play.paused,
          'pause': this.props.play.paused
        })}
      >
        <div/><div/><div/>
      </div>
    );
  }
}

export default connect(
  state => ({
    play: state.play
  }),
  dispatch => bindActionCreators(Actions, dispatch)
)(PlayAnimation);
