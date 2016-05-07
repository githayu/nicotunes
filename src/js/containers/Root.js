import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { CircularProgress } from 'material-ui'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import BaseTheme from '../utils/BaseTheme'
import * as Actions from '../actions/App'
import Login from './Login'
import MyList from './Mylist'
import MyLists from './Mylists'
import Ranking from './Ranking'
import Search from './Search'
import Settings from './Settings'
import PlayContent from '../containers/PlayContent'
import Navigation from '../containers/Navigation'
import Player from './Player'
import Queue from './Queue'

export default class Root extends Component {
  getChildContext() {
    return {
      muiTheme: getMuiTheme(BaseTheme)
    }
  }

  componentWillMount() {
    this.props.niconicoAccount();
  }

  render() {
    if (this.props.app.location == 'initialize') {
      return (
        <div id="nicotunes" className="initialize">
          <Navigation />

          <div className="loading-progress">
            <CircularProgress />
          </div>
        </div>
      );
    }

    var signature = {
      [this.props.app.location]: true,
      loading: this.props.app.loading,
      playing: this.props.play.active
    },

    renderTitleBar = [];

    if (process.platform !== 'win32') {
      renderTitleBar = <header className="title-bar">NicoTunes</header>
    }

    return (
      <div id="nicotunes" className={classNames(signature)}>
        <Navigation />

        <div className="main-wrapper">
          { renderTitleBar }

          <div className="content-container">
            <div className="content">
              { this.contentRender() }

              <Player />
              <Queue />
              <div className="loading-progress">
                <CircularProgress />
              </div>
            </div>

            { this.props.play.active ? <PlayContent /> : [] }

          </div>
        </div>
      </div>
    );
  }

  contentRender() {
    switch (this.props.app.location) {
      case 'mylist': return <MyList />
      case 'mylists': return <MyLists />;
      case 'ranking': return <Ranking />;
      case 'search': return <Search />;
      case 'settings': return <Settings />;
        default: return <Login />;
    }
  }
}

Root.childContextTypes = {
  muiTheme: PropTypes.object.isRequired
}

export default connect(
  state => ({
    app: state.app,
    play: state.play
  }),
  dispatch => bindActionCreators(Actions, dispatch)
)(Root);
