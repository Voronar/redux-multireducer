# Концепция мультиредьюсера Redux ([EN](https://github.com/Voronar/redux-multireducer/blob/master/README.md))
## Проблема
Если мы хотим переиспользовать нашу функцию-редьюсер для нескольких экземпляров конечного редьюсера, то мы сталкиваемся с проблемой. [Создатель](https://github.com/gaearon) Redux вот что пишет по этому поводу:
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

## Решение

#### Для решения этой проблемы нам нужны ```уникальные``` типы экшенов для определенной версии нашей функции-редьюсера.

## Решение с использованием ФП
[Дэн](https://github.com/gaearon) предлагает [решение](http://redux.js.org/docs/recipes/reducers/ReusingReducerLogic.html#customizing-behavior-with-higher-order-reducers) из мира *функционального программирования* - редьюсер высшего порядка. Он оборачивает редьюсер с помощью функции высшего порядка (*_ФВП_*) и именует тип экшена с помощью дополнительного суффикса/префикса, пробрасываемого через *_ФВП_*. Похожий подход (он специализирует   объект-экшен с помощью специального ```мета-ключа```) использует [Erik Rasmussen](https://github.com/erikras) в своей [библиотеке](https://github.com/erikras/multireducer).

## Решение с использованием ООП
Я предлагаю более-менее схожий подход, но без обёрток, суффиксов/преффиксов, мета-ключей и тому подобного. В секции решения я выделил слово ```специфичные``` не без причины. Что, если мы возьмём и сделаем тип экшена ДЕЙСТВИТЕЛЬНО уникальным? Встречайте, [```Symbol```](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol). Вырезка с сайта MDN:

>Every symbol value returned from Symbol() is unique.  A symbol value may be used as an identifier for object properties; this is the data type's only purpose.

Идеальный вариант, не правда ли? А причём тут *объектно-ориентированное программирование*? ООП позволяет организовать наш код наиболее оптимальным образом и сделать наши типы экшенов уникальными. Способ организация Redux-ингридиентов (или Redux-модуля) был навеян [модульным Redux](https://github.com/erikras/ducks-modular-redux) всё того же [Erik Rasmussen](https://github.com/erikras).
Давайте попробуем применить этот подход на примере React-приложения для отображения списков (рабочий пример находится в этом репозитории, просто скопируйте репозиторий, и запустите пару комманд ```npm i``` и ```npm run start```).

> ️️ **ПРЕДУПРЕЖДЕНИЕ** ️️ ```Symbol``` константы накладывают некоторые ограничения на такие возможности Redux, как отладка с перемещением во времени, запись и воспроизведение экшенов. Больше информации читайте [тут](http://redux.js.org/docs/faq/Actions.html#actions-string-constants). 😉 Но эта проблема [легко решается](https://github.com/Voronar/redux-multireducer/blob/master/src/redux/modules/list/List.devtools.ready.js).

## Пример (React-приложение для отображения списков)
### Redux ```list``` модуль

Redux ```list``` модуль - директория в которой расположены Redux-класс модуля и требуемые экземпляры этого модуля.

#### ```src/redux/modules/list/List.js``` - Redux-класс модуля списка

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
```

>⚠️️ **ВАЖНО** ⚠️️ Генераторы экшенов и редьюсер должны быть методами экземпляра класса, а не его прототипа, в противном случае вы потеряете ```this```.

#### ```src/redux/modules/list/index.js``` - Экземпляры модуля Redux

```javascript
// Redux list module class
import List from './List';

export default {
  users: new List(),
  posts: new List(),
};
```
Просто создаём класс Redux-модуля и переиспользуем его, делаю столько экземпляров, сколько требуется.

#### ```src/redux/modules/reducer.js``` - Главный редьюсер

```javascript
import { combineReducers } from 'redux';

// required Redux module instances
import list from './list/index';

export default combineReducers({
  users: list.users.reducer,
  posts: list.posts.reducer,
});
```

#### ```src/components/ListView.js``` - React-компонент для отображения списков

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

#### ```src/App.jsx``` - Использование React-компонента для отображения списков

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

## Заключение
Таким образом, используя современный JavaScript вы можете сделать ваш Redux-модуль более удобным для переиспользования. Буду рад услышать критику и предложения в секции [Issue](https://github.com/Voronar/redux-multireducer/issues) этого репозитория.
