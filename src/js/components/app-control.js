import React, { Component } from 'react'
import Remote from 'remote'

export default class AppControl extends Component {
  render() {
    return (
      <ul className="app-control">
        <li onClick={this.control.bind(this, 'close')} className="close"></li>
        <li onClick={this.control.bind(this, 'minimize')} className="minimize"></li>
        <li onClick={this.control.bind(this, 'maximize')} className="maximize"></li>
      </ul>
    );
  }

  control(cmd) {
    Remote.getCurrentWindow()[cmd]();
  }
};
