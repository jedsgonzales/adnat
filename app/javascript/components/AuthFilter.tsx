import React, { ComponentClass, ComponentElement } from "react";
import { connect } from 'react-redux';
import { AdnatState } from "../types";
import { AuthState } from './../types/auth-types';
import Login from "./Login";

interface IAuthFilterProps {
  auth: AuthState;
  reactComponent: React.LazyExoticComponent<any>;
}

interface IAuthFilterState {
}

class AuthFilter extends React.Component<IAuthFilterProps, IAuthFilterState> {
  render() {
    if(this.props.auth.user !== null) {
      return <this.props.reactComponent auth={this.props.auth} />
    } else {
      return <Login { ...this.props } />
    }
  }
}

function mapStateToProps(state:AdnatState) {
  return { auth: state.auth };
}

export default connect(mapStateToProps)(AuthFilter);

