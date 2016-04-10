import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { RaisedButton } from 'material-ui'

import * as Actions from '../actions/app'

export default class Login extends Component {
  render() {
    return (
      <form className="login-container" onSubmit={this.login.bind(this)}>
        <p className="login-form-message">niconico アカウント情報を入力してください</p>

        <div className="login-form-inner">
          <fieldset className="login-form-email">
            <legend>メールアドレス</legend>
            <input type="email" ref="mail_tel" />
          </fieldset>

          <fieldset className="login-form-password">
            <legend>パスワード</legend>
            <input type="password" ref="password" />
          </fieldset>

          <RaisedButton
            label="ログイン"
            type="submit"
            primary={true}
            fullWidth={true}
            backgroundColor="#0277BD"
            className="login-submit"/>
        </div>
      </form>
    );
  }

  login(e) {
    e.preventDefault();

    this.props.NiconicoLogin({
      mail_tel: this.refs.mail_tel.value.trim(),
      password: this.refs.password.value.trim()
    });
  }
}

export default connect(
  state => ({
    app: state.app
  }),
  dispatch => bindActionCreators(Actions, dispatch)
)(Login);
