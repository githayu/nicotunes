import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { CircularProgress } from 'material-ui'

import * as Actions from '../actions/app'

import Login from './login'
import MyList from './mylist'
import MyLists from './mylists'
import Ranking from './ranking'
import Search from './search'
import Settings from './settings'

import Navigation from '../containers/navigation'
import Player from './player'
import Queue from './queue'

export default class Root extends Component {
  componentWillMount() {
    this.props.NiconicoAccount();
  }

  render() {
    if (this.props.app.location == 'initialize') {
      return (
        <div id="nico-tunes">
          <Navigation />

          <div className="loading-progress">
            <CircularProgress color="#0288d1" />
          </div>
        </div>
      );
    }

    let signature = {
      [this.props.app.location]: true,
      loading: this.props.app.loading
    };

    return (
      <div id="nico-tunes" className={classNames(signature)}>
        <Navigation />

        <div className="content">
          { this.contentRender() }

          <Player />
          <Queue />
          <div className="loading-progress">
            <CircularProgress color="#0288d1" />
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

export default connect(
  state => ({
    app: state.app
  }),
  dispatch => bindActionCreators(Actions, dispatch)
)(Root);
