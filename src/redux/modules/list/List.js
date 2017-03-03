import * as services from './../../../api/services';

const initialState = {
  list: [],
};

function getListReducer(state, action) {
  return {
    ...state,
    list: action.payload.list,
  };
}

function removeItemReducer(state, action) {
  const { payload } = action;
  const list = state.list.filter((item, i) => i !== payload.index);
  return {
    ...state,
    list,
  };
}

export default class List {
  constructor() {
    this.GET_LIST = Symbol('GET_LIST');
    this.REMOVE_ITEM = Symbol('REMOVE_ITEM');
  }
  getList = (serviceName) => {
    return async (dispatch) => {
      const list = await services[serviceName].get();
      dispatch({
        type: this.GET_LIST,
        payload: {
          list,
          serviceName,
        },
      });
    };
  }
  removeItem = (index) => {
    return (dispatch) => {
      dispatch({
        type: this.REMOVE_ITEM,
        payload: {
          index,
        },
      });
    };
  }
  reducer = (state = initialState, action) => {
    switch (action.type) {
      case this.GET_LIST:
        return getListReducer(state, action);

      case this.REMOVE_ITEM:
        return removeItemReducer(state, action);

      default:
        return state;
    }
  }
}
