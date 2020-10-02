import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.scss';
import Auth from './components/Auth';
import PrivateRoute from './components/PrivateRoute';
import Theater from './components/Theater';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducers from './reducers';
import ReactNotification from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';

const store = createStore(reducers, {});

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <ReactNotification />
        <Switch>
          <Route exact={true} path="/" component={Auth} />
          <PrivateRoute exact={true} path="/theater" component={Theater} />
        </Switch>
      </Router>
    </Provider>
  );
};

export default App;
