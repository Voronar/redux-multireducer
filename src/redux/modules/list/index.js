import { List, handlePayload } from './List';
import { createAction } from 'redux-actions';

const posts = new List('posts');

posts.initialState = {
  ...posts.initialState,
  metaInfo: {},
};

posts.transformers.getList = (s => s);

posts.setMetaInfo = createAction(`${posts.namespace}/setMetaInfo`);

posts.reducer = {
  ...posts.reducer,
  [posts.setMetaInfo]: handlePayload('metaInfo'),
};

export default {
  users: new List('users'),
  posts,
};
