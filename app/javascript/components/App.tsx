import React from 'react';
import axios from 'axios';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { Spinner } from "reactstrap";
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';

import reducers from "../reducers";
import { redirectToLogin } from '../actions/auth-actions';
import AuthFilter from './AuthFilter';

const appStore = createStore(reducers
  ,compose(
  applyMiddleware(reduxThunk)
));

interface IAppProps {

};

interface IAppState {

};

axios.interceptors.response.use((response) => {
  return response;
}, (error) => {
    if (401 === error.response.status) {
        appStore.dispatch(redirectToLogin());
    }

    return Promise.reject(error);
});

const Dashboard = React.lazy(() => import('./Dashboard'));
const OrganizationList = React.lazy(() => import('./OrganizationList'));
const Register = React.lazy(() => import('./Register'));
const ForgotPassword = React.lazy(() => import('./ForgotPassword'));

class App extends React.Component<IAppProps, IAppState> {
  loading = () => (
    <div className="animated fadeIn pt-1 text-center">
      <Spinner style={{ width: '3rem', height: '3rem' }} type="grow" />
    </div>)

  render () {
    return (
      <Provider store={appStore}>
        <HashRouter>
          <React.Suspense fallback={this.loading}>
            <Switch>
              <Route exact path='/register' render={ props => <Register /> } />
              <Route exact path='/forgot-password' render={ props => <ForgotPassword /> } />} />
              <Route exact path='/' render={ props => <AuthFilter reactComponent={Dashboard} />} />} />
              <Route exact path='/organization-list' render={ props => <AuthFilter reactComponent={OrganizationList} />} />} />
            </Switch>
          </React.Suspense>
        </HashRouter>
      </Provider>
    );
  }
}

export default App;
