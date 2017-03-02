import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

import reducer from './modules/reducer';

export default function createReduxStore() {
  const middlewares = [thunk, createLogger()];

  const store = createStore(reducer, applyMiddleware(...middlewares));

  return store;
}