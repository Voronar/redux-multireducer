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
