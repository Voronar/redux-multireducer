import { combineReducers } from 'redux';

import list from './list/index';

export default combineReducers({
  users: list.users.reducer,
  posts: list.posts.reducer,
});
