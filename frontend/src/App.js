import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Home from './Views/Home';
import Verify from './Views/Verify';

class App extends Component {
  render() {
    return (
    <Router>
        {/* <div>
          <h2>Welcome to React Router Tutorial</h2>
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <ul className="navbar-nav mr-auto">
            <li><Link to={'/'} className="nav-link"> Home </Link></li>
            <li><Link to={'/verify'} className="nav-link">Contact</Link></li>
          </ul>
          </nav>
          <hr /> */}
          <Switch>
              <Route exact path='/' component={Home} />
              <Route path='/verify/:id' component={Verify} />
          </Switch>
        {/* </div> */}
      </Router>
    );
  }
}

export default App;