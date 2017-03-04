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


function actionType(name) {
  return { 
    type: name,
    metaType: Symbol(name),
  };
}

export default class List {
  constructor(prefix) {
    this.GET_LIST = actionType(`${prefix}/GET_LIST`);
    this.REMOVE_ITEM = actionType(`${prefix}/REMOVE_ITEM`);
  }
  getList = (serviceName) => {
    return async (dispatch) => {
      const list = await services[serviceName].get();
      const { type, metaType } = this.GET_LIST;
      dispatch({
        payload: {
          list,
          serviceName,
        },
        type,
        metaType,
      });

    };
  }
  removeItem = (index) => {
    return (dispatch) => {
      const { type, metaType } = this.REMOVE_ITEM;
      dispatch({
        payload: {
          index,
        },
        type,
        metaType,
      });
    };
  }
  reducer = (state = initialState, action) => {
    switch (action.metaType) {
      case this.GET_LIST.metaType:
        return getListReducer(state, action);

      case this.REMOVE_ITEM.metaType:
        return removeItemReducer(state, action);

      default:
        return state;
    }
  }
}
