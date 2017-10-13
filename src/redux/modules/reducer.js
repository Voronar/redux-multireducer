import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';

import list from './list/index';

export default combineReducers({
  users: handleActions(list.users.reducer, list.users.initialState),
  posts: handleActions(list.posts.reducer, list.posts.initialState),
});
