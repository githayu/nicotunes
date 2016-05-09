import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, compose, createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { getMuiTheme, MuiThemeProvider } from 'material-ui/styles';
import BaseTheme from '../js/utils/BaseTheme';
import * as reducers from '../js/reducers';
import { Root } from '../js/containers';

injectTapEventPlugin();

const loggerMiddleware = createLogger();
const reducer = combineReducers({
  ...reducers
});

const finalCreateStore = compose(
  applyMiddleware(
    loggerMiddleware,
    thunkMiddleware
  )
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
