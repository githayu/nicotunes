import Remote, { Menu, dialog as Dialog } from 'remote'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Tabs, Tab, RaisedButton } from 'material-ui'
import * as Actions from '../actions/App'

export default class Settings extends Component {
  constructor() {
    super();

    this.state = {
      value: 'account'
    };
  }

  handleChange(value) {
    console.log(value,this);
    this.setState({
      value: value
    });
  }

  render() {
    return (
      <div className="settings-container">
        <Tabs
          tabItemContainerStyle={{
            borderBottom: '1px rgba(0,0,0,.15) solid',
            position: 'relative',
            zIndex: 1
          }}
          inkBarStyle={{
            height: '3px',
            marginTop: '-3px',
            zIndex: 2
          }} >

          <Tab
            label="アカウント"
            value="account">

            <table className="nico-accounts">
              <caption>アカウント設定</caption>

              <thead>
                <tr>
                  <th></th>
                  <th>名前</th>
                  <th>アクティブ</th>
                </tr>
              </thead>

              <tbody>
              {
                this.props.accounts.niconico.items.map(u => {
                  let active = u.id == this.props.accounts.niconico.selected.id;

                  return (
                    <tr key={u.id} data-user-id={u.id}
                        onClick={this.activeNicoAccountRadio.bind(this, u)}
                        onContextMenu={this.nicoAccountContextMenu.bind(this, u)} >

                      <td><img className="account-icon" src={u.thumbnailUrl} alt={u.nickname} /></td>
                      <td>{u.nickname}</td>
                      <td><input
                            type="radio"
                            className="active-niconico-account"
                            defaultValue={u.id}
                            name="active-niconico-account"
                            defaultChecked={active}
                            ref={`activeNicoAccountRadio-${u.id}`} /></td>
                    </tr>
                  );
                })
              }
              </tbody>
            </table>

            <RaisedButton
              onClick={this.props.Router.bind(this, 'login')}
              label="アカウントを追加"
              className="add-niconico-account"
              style={{
                width: '50%',
                margin: '20px auto',
                display: 'block'
              }}/>
          </Tab>
        </Tabs>
      </div>
    );
  }

  activeNicoAccountRadio(account) {
    this.refs[`activeNicoAccountRadio-${account.id}`].checked = true;
    this.props.nicoAccountController({
      type: 'change',
      account
    });
  }

  nicoAccountContextMenu(account) {
    let menu = [
      {
        label: `${account.nickname} (${account.id}) を削除`,
        click: this.props.nicoAccountController.bind(this, {
          type: 'delete',
          account
        })
      }
    ];

    Menu.buildFromTemplate(menu).popup(Remote.getCurrentWindow());
  }

  nicoAccountDelete(account) {
    if (this.props.accounts.niconico.selected.id != account.id) {
      this.props.nicoAccountController({
        type: 'delete',
        account
      });
    } else {
      Dialog.showMessageBox({
        type: 'info',
        buttons: ['OK'],
        message: 'アクティブアカウントは削除できません'
      }, response => {
        console.log(response);
      });
    }
  }
}

export default connect(
  state => ({
    accounts: state.accounts
  }),

  dispatch => bindActionCreators(Actions, dispatch)
)(Settings);
