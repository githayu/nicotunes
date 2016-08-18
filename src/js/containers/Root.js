import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { CircularProgress } from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import BaseTheme from '../utils/BaseTheme';
import { accountActions } from '../actions';
import * as Views from './';

class Root extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      muiTheme: getMuiTheme(BaseTheme)
    };
  }

  componentWillMount() {
    this.props.actions.niconicoAccount();
  }

  contentRender() {

    switch (this.props.app.location) {
      case 'mylist': return <Views.MyList />;
      case 'mylists': return <Views.MyLists />;
      case 'ranking': return <Views.Ranking />;
      case 'search': return <Views.Search />;
      case 'settings': return <Views.Settings />;
      default: return <Views.Login />;
    }
  }

  render() {
    if (this.props.app.location == 'initialize') {
      return (
        <div
          id="nicotunes"
          className="initialize"
        >
          <Views.Navigation />
          <div className="loading-progress">
            <CircularProgress />
          </div>
        </div>
      );
    }

    var renderTitleBar = [],
        signature = {
          [this.props.app.location]: true,
          loading: this.props.app.loading,
          playing: this.props.play.active
        };

    if (process.platform !== 'win32') {
      renderTitleBar = <header className="title-bar">NicoTunes</header>;
    }

    return (
      <div
        id="nicotunes"
        className={classNames(signature)}
      >
        <Views.Navigation />
        <div className="main-wrapper">
          { renderTitleBar }
          <div className="content-container">
            <div className="content">
              { this.contentRender() }
              <Views.Player />
              <Views.Queue />
              <div className="loading-progress">
                <CircularProgress />
              </div>
            </div>
            { this.props.play.active ? <Views.PlayContent /> : [] }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    app: state.app,
    play: state.play
  }),
  dispatch => ({
    actions: bindActionCreators(accountActions, dispatch)
  })
)(Root);
