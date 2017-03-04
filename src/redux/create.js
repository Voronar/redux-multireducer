import { createStore, applyMiddleware, compose } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

import reducer from './modules/reducer';

export default function createReduxStore() {
  const middlewares = [thunk, createLogger()];
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(reducer, composeEnhancers(applyMiddleware(...middlewares)));

  return store;
}