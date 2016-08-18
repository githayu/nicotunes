import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { IconButton } from 'material-ui';
import { appActions } from '../actions';

class Navigation extends Component {
  static defaultProps = {
    list: [
      { id: 'mylists', name: 'マイリスト', target: [ 'mylists', 'mylist'] },
      { id: 'ranking', name: 'ランキング', target: [ 'ranking'] },
      { id: 'search', name: '検索', target: [ 'search'] },
      { id: 'settings', name: '設定', target: [ 'settings'] }
    ]
  };

  userIconRender() {
    if (this.props.accounts.niconico.selected &&
        this.props.accounts.niconico.selected.code === undefined) {
      const account = this.props.accounts.niconico.selected;

      return (
        <img
          className="avatar-image"
          src={account.thumbnailUrl}
          alt={account.nickname}
        />
      );
    }
  }

  render() {
    return (
      <nav className="navigation">
        <div className="avatar">
          { this.userIconRender() }
        </div>

        <div className="navigation-list">{
          this.props.list.map(i => {
            return (
              <IconButton
                onClick={this.props.actions.Router.bind(this, i.id)}
                key={i.id}
                iconClassName={classNames({
                  [`${i.id}-link`]: true,
                  selected: (i.target.indexOf(this.props.app.location) !== -1)
                })}
              />
            );
          })
        }</div>
      </nav>
    );
  }
}

export default connect(
  state => ({
    app: state.app,
    accounts: state.accounts
  }),
  dispatch => ({
    actions: bindActionCreators(appActions, dispatch)
  })
)(Navigation);
