import { remote } from 'electron';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { mylistActions, appActions } from '../actions';
import CreateContextMeun from '../utils/ContextMenu';

class MyLists extends Component {
  componentDidMount() {
    if (this.props.accounts.niconico.selected.id != this.props.mylist.userId) {
      this.props.actions.mylistsLookup(this.props.accounts.niconico.selected);
    }
  }

  contextMenu() {
    let menu = new CreateContextMeun(this, [
      {
        label: 'マイリスト更新',
        click: this.props.actions.mylistsLookup.bind(this, this.props.accounts.niconico.selected, true)
      }
    ]);

    remote.Menu.buildFromTemplate(menu).popup(remote.getCurrentWindow());
  }

  mylistLink(id) {
    let mylist = (() => {
      for (let mylist of this.props.mylist.items) {
        if (mylist.id == id) return mylist;
      }
    })();

    if (!mylist.fetchAll) {
      this.props.actions.getMylistVideos({
        account: this.props.accounts.niconico.selected,
        request: { id }
      });
    } else {
      this.props.actions.Router('mylist', { mylist });
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
  dispatch => ({
    actions: bindActionCreators(Object.assign({}, mylistActions, appActions), dispatch)
  })
)(MyLists);
