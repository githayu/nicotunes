import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RaisedButton } from 'material-ui';
import { accountActions } from '../actions';

class Login extends Component {
  login(e) {
    e.preventDefault();

    this.props.actions.niconicoLogin({
      mail_tel: this.refs.mail_tel.value.trim(),
      password: this.refs.password.value.trim()
    });
  }

  render() {
    return (
      <form
        className="login-container"
        onSubmit={::this.login}
      >
        <p className="login-form-message">{'niconico アカウント情報を入力してください'}</p>

        <div className="login-form-inner">
          <fieldset className="login-form-email">
            <legend>{'メールアドレス'}</legend>
            <input type="email"
              ref="mail_tel"
            />
          </fieldset>

          <fieldset className="login-form-password">
            <legend>{'パスワード'}</legend>
            <input type="password"
              ref="password"
            />
          </fieldset>

          <RaisedButton
            label="ログイン"
            type="submit"
            fullWidth
            className="login-submit"
          />
        </div>
      </form>
    );
  }
}

export default connect(
  state => ({
    app: state.app
  }),
  dispatch => ({
    actions: bindActionCreators(accountActions, dispatch)
  })
)(Login);
