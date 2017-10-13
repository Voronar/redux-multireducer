import * as services from './../../../api/services';
import { createAction } from 'redux-actions';

export function handlePayload(field) {
  return (state, { payload }) => ({ ...state, [field]: payload });
}

export class List {
  constructor(namespace) {
    this.namespace = namespace;
    this.transformers = {};
    this.initialState = {
      list: [],
      isFetching: false,
    };
    
    this.removeItem = createAction((`${namespace}/removeItem`));
    this.setList = createAction((`${namespace}/setList`));
    this.setFetchingStatus = createAction((`${namespace}/setFetchingStatus`));

    this.reducer = {
      [this.setList]: handlePayload('list'),
      [this.setFetchingStatus]: handlePayload('isFetching'),
      [this.removeItem]: (state, { payload }) => ({
        ...state,
        list: state.list.filter((item, i) => i !== payload),
      }),
    };
  }

  getList = (serviceName, payload = {}) => async (dispatch) => {
    try {
      dispatch(this.setFetchingStatus(true));

      const list = await services[serviceName].get(payload);

      dispatch(this.setList((this.transformers.getList || (s => s))(list)));
      dispatch(this.setFetchingStatus(false));
    } catch (error) {
      dispatch(this.setFetchingStatus(false));
    }
  }

  removeRemoteItem = (serviceName, payload = {}, callback) => async (dispatch) => {
    try {
      dispatch(this.setFetchingStatus(true));

      const response = await services[serviceName].delete(payload);
      dispatch(this.setFetchingStatus(false));

      if (callback) {
        callback(response);
      } else {
        dispatch(this.getList());
      }
    } catch (error) {
      dispatch(this.setFetchingStatus(false));
    }
  }
}
