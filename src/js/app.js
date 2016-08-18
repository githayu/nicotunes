import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, compose, createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { getMuiTheme, MuiThemeProvider } from 'material-ui/styles';
import BaseTheme from '../js/utils/baseTheme';
import * as reducers from '../js/reducers';
import { Root } from '../js/containers';

injectTapEventPlugin();

var middleware = [];

if (process.title.includes('prebuilt')) {
  middleware.push(require('redux-logger')());
}

const reducer = combineReducers({
  ...reducers
});

const finalCreateStore = compose(
  applyMiddleware(...[
    thunkMiddleware
  ].concat(middleware))
)(createStore);

const store = finalCreateStore(reducer);
const nicoTunesTheme = getMuiTheme(BaseTheme);

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={nicoTunesTheme}>
      <Root />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('app')
);
