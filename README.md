# Redux multireducer concept ([RU](https://github.com/Voronar/redux-multireducer/blob/master/README.ru.md))
## The problem
When we want to reuse our single reducer function for multiple reducer instances we face a problem. Redux [creator](https://github.com/gaearon) write:
> As an example, let's say that we want to track multiple counters in our application, named A, B, and C. We define our initial ```counter``` reducer, and we use ```combineReducers``` to set up our state:

```javascript
function counter(state = 0, action) {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1;
        case 'DECREMENT':
            return state - 1;
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    counterA : counter,
    counterB : counter,
    counterC : counter
});
```

>Unfortunately, this setup has a problem. Because ```combineReducers``` will call each slice reducer with the same action, dispatching ```{type : 'INCREMENT'}``` will actually cause all three counter values to be incremented, not just one of them.

## The solution

#### To solve this problem we need a ```specific``` action types for the specialized version of our reducer function.

## FP solution
[Dan](https://github.com/gaearon) offers a [solution](http://redux.js.org/docs/recipes/reducers/ReusingReducerLogic.html#customizing-behavior-with-higher-order-reducers) from a world of *functional programming* - higher-order reducer. He wraps the reducer with a higher-order function (*_HOF_*) and specify an action type this suffix/prefix passing it from *_HOF_*. The same approach (he specifies action object with special ```meta-key```) use [Erik Rasmussen](https://github.com/erikras) in his [library](https://github.com/erikras/multireducer).

## OOP solution
I approach more or less the same solution but without wrappers, suffixes/prefixes, meta-keys, etc. I highlighted ```specific``` word in a solution section not without a reason. What if we do an action type **REALY** unique? Greeting, [```Symbol```](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol). From MDN:
>Every symbol value returned from Symbol() is unique.  A symbol value may be used as an identifier for object properties; this is the data type's only purpose.

Perfect choice, is not it? And why we need *object-oriented programming*? OOP help us to optimize the code organization and make our action types unique. Redux ingredients (or *Redux module*) organization (reducer, constants, action creators) was inspired by a [modular redux](https://github.com/erikras/ducks-modular-redux) approach from all the same developer [Erik Rasmussen](https://github.com/erikras).
Let's try the approach in a list view React application example (working example included in this repository, just clone it, ```npm i``` and ```npm run start```).

## Example (list view React application)
### Redux ```list``` module
Redux ```list``` module is a directory that includes redux module class and required module instances.

#### ```src/redux/modules/list/List.js``` - Redux list module class

```javascript
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
    // action types constants
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
    return async (dispatch) => {
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
```

>⚠️️ **IMPORTANT** ⚠️️ Action creators and reducer must be class instance methods, not prototype methods otherwise you will loose your ```this```.

#### ```src/redux/modules/list/index.js``` - Redux module instances

```javascript
// Redux list module class
import List from './List';

export default {
  users: new List(),
  posts: new List(),
};
```
Just create Redux module class and reuse it making so many instances as we need.

#### ```src/redux/modules/reducer.js``` - main reducer

```javascript
import { combineReducers } from 'redux';

// required Redux module instances
import list from './list/index';

export default combineReducers({
  users: list.users.reducer,
  posts: list.posts.reducer,
});
```

#### ```src/components/ListView.js``` - React list view component

```javascript
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";

// Redux module instances
import list from './../redux/modules/list';

class ListView extends React.Component {
  componentWillMount() {
    this.props.getList(this.props.serviceName);
  }
  render() {
    return (
      <div>
        <h1>{this.props.serviceName}</h1>
        <ul>
          {this.props.list.map((item, i) =>
            <span key={i}>
              <li style={{ width: 100 }}>
                {item}
                <button style={{ float: 'right' }} onClick={() => this.props.removeItem(i)}>x</button>
              </li>

            </span>)
          }
        </ul>
        <button onClick={() => this.props.getList(this.props.serviceName)}>Update</button>
      </div>
    );
  }
}

const mapStateToProps = (state, { serviceName }) => ({
  ...state[serviceName],
});

const mapDispatchToProps = (dispatch, { serviceName }) => ({
  ...bindActionCreators({ ...list[serviceName]}, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ListView);
```

#### ```src/App.jsx``` - React list view component using

```javascript
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ListView from './components/ListView';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Try to Redux multireducer</h2>
        </div>
        <ListView serviceName="users" />
        <ListView serviceName="posts" />
      </div>
    );
  }
}

export default App;
```

## Conclusion

This way using modern JavaScript you can do  your Redux module more reusable. I will be glad to listen your suggestions and critique in repository [Issue](https://github.com/Voronar/redux-multireducer/issues) section.
