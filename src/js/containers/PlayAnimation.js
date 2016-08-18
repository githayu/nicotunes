import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

class PlayAnimation extends Component {
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
  })
)(PlayAnimation);
