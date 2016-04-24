import React from 'react'
import ReactDOM from 'react-dom'
import { applyMiddleware, compose, createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import injectTapEventPlugin from 'react-tap-event-plugin'
import electron, { ipcRenderer } from 'electron'

import * as reducers from '../js/reducers'
import { Root } from '../js/containers'

injectTapEventPlugin();

const loggerMiddleware = createLogger()
const reducer = combineReducers({
  ...reducers
})

const finalCreateStore = compose(
  applyMiddleware(
    loggerMiddleware,
    thunkMiddleware
  )
)(createStore)

const store = finalCreateStore(reducer)

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('app')
);

ipcRenderer.on('debug', (...args) => {
  console.log('debugLog:', args);
});
