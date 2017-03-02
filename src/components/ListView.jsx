import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";

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