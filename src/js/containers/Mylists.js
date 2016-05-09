import Remote, { Menu } from 'remote';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../actions/App';
import CreateContextMeun from '../utils/ContextMenu';

export default class MyLists extends Component {
  componentDidMount() {
    if (this.props.accounts.niconico.selected.id != this.props.mylist.userId) {
      this.props.mylistsLookup(this.props.accounts.niconico.selected);
    }
  }

  contextMenu() {
    let menu = new CreateContextMeun(this, [
      {
        label: 'マイリスト更新',
        click: this.props.mylistsLookup.bind(this, this.props.accounts.niconico.selected, true)
      }
    ]);

    Menu.buildFromTemplate(menu).popup(Remote.getCurrentWindow());
  }

  mylistLink(id) {
    let mylist = (() => {
      for (let mylist of this.props.mylist.items) {
        if (mylist.id == id) return mylist;
      }
    })();

    if (!mylist.fetchAll) {
      this.props.getMylistVideos({
        account: this.props.accounts.niconico.selected,
        request: { id }
      });
    } else {
      this.props.Router('mylist', { mylist });
    }
  }

  render() {
    if (!this.props.mylist.items) {
      return <div className="mylist-list-container" />;
    }

    return (
      <div
        className="mylist-list-container"
        onContextMenu={::this.contextMenu}
      >
        <ul className="mylist-list">
          {
            this.props.mylist.items.map(mylist => {
              if (typeof mylist.code != 'undefined' || !mylist.myListEntries.items.length) return;

              return (
                <li
                  key={mylist.id}
                  onClick={this.mylistLink.bind(this, mylist.id)}
                >
                  <figure className="list-thumbnail">
                    {
                      mylist.myListEntries.items.map(item => {
                        return (
                          <div
                            key={item.videoId}
                            style={{
                              backgroundImage: `url(${item.thumbnailUrl})`
                            }}
                          />
                        );
                      })
                    }
                  </figure>

                  <div className="list-info">
                    <h2>{mylist.name}</h2>
                    <p className="list-description">{mylist.description}</p>
                  </div>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
}

export default connect(
  state => ({
    mylist: state.mylist,
    accounts: state.accounts
  }),
  dispatch => bindActionCreators(Actions, dispatch)
)(MyLists);
