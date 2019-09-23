import React from "react";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, FormFeedback, Spinner } from "reactstrap";
import axios, { AxiosResponse, AxiosError } from "axios";
import { Link } from "react-router-dom";
import { AdnatState } from "../types";
import { connect } from "react-redux";
import { AuthState } from "../types/auth-types";
import { authSuccess, authByToken } from "../actions/auth-actions";

interface ILoginProps {
  auth: AuthState;
  authSuccess:Function;
  authByToken:Function;
}

interface ILoginState {
  email: string;
  password: string;
  remember: boolean;
  message: string;
  logged_in: boolean;
  loading: boolean;
}

class Login extends React.Component <ILoginProps, ILoginState> {

  constructor(props) {
    super(props);
    this.state = { 
      email: '',
      password: '',
      remember: false,
      message: '',
      logged_in: false,
      loading: false
    }
  }

  loading = () => (
    <div className="animated fadeIn pt-1 text-center">
      <Spinner style={{ width: '3rem', height: '3rem' }} type="grow" />
    </div>)

  componentDidMount(){
    let savedToken = localStorage.getItem('JWT_TOKEN');
    if(savedToken !== null && savedToken.trim() !== ''){
      this.props.authByToken(savedToken);
    }
  }

  preventSubmit = (e:React.FormEvent) => {
    e.preventDefault();
  }

  processAuth = async () => {
    this.setState({...this.state, loading: true});

    try {
      return await axios.post("/api/users/authenticate",
      {
        email: this.state.email,
        pass: this.state.password
      }, {
        headers: { 
          'Content-Type':     'application/json'
        }
      }).then( (resp: AxiosResponse) => {
        this.props.authSuccess(resp.data.user, resp.data.token);
        
        if(this.state.remember){
          localStorage.setItem('JWT_TOKEN', resp.data.token);
        }

        this.setState({ ...this.state, logged_in: true, loading: false });

      }).catch( (error:AxiosError) => {
        
        if(error.response.data.message){
          this.setState({ ...this.state, message: error.response.data.message });
        } else if(error.response.data.errors && error.response.data.errors.length > 0) {
          this.setState({ ...this.state, message: error.response.data.errors[0] });
        } else {
          this.setState({ ...this.state, message: 'Try again later.' });
        }

        this.setState({...this.state, loading: false});
      });

    } catch(error) {
      this.setState({ ...this.state, message: 'Handling error.', loading: false });
    }
  }

  renderForm = () => {
    return (
      <Container>
        <Row>
        <Col>&nbsp;</Col>
          <Col>
            <h1>Adnat System</h1>
          </Col>
          <Col>&nbsp;</Col>
        </Row>
        <Row>
          <Col>
            &nbsp;
          </Col>
        </Row>
        <Row>
          <Col>&nbsp;</Col>
          <Col>
            <Form onSubmit={this.preventSubmit}>
              <FormGroup>
                <Label for="loginEmail">Email</Label>
                <Input type="email" name="email" id="loginEmail" value={this.state.email} placeholder="user@domain.com" onChange={(e) => {
                  this.setState({ ...this.state, email: e.target.value });
                }} invalid={this.state.message != ''} />
                <FormFeedback>{this.state.message}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="loginPassword">Password</Label>
                <Input type="password" name="password" id="loginPassword" value={this.state.password} onChange={(e) => {
                  this.setState({ ...this.state, password: e.target.value });
                }} />
              </FormGroup>
              <FormGroup check inline>
                <Button onClick={this.processAuth} disabled={this.state.email.trim() === '' || this.state.password.trim() === ''}>Login</Button>{' '}
              </FormGroup>
              <FormGroup check inline>
                <Label check>
                  <Input type="checkbox" checked={this.state.remember} onChange={(e) => {
                    this.setState({ ...this.state, remember: e.target.checked });
                  }} /> Remember Me
                </Label>
              </FormGroup>
              <FormGroup>
                <br />
                <Link to="/register" className="btn btn-primary">Sign Up</Link>{' '}
                <Link to="/forgot-password" className="btn btn-secondary">Forgot Password</Link>  
              </FormGroup>
              
              
            </Form>
          </Col>
          <Col>&nbsp;</Col>
        </Row>
      </Container>
    );
  }

  render() {
    if(this.state.loading) {
      return this.loading();
    } else {
      return this.renderForm();
    }
  }
}

const mapStateToProps = (state:AdnatState) => ({
  auth: state.auth
})

export default connect(
  mapStateToProps, 
  { authSuccess,
    authByToken })(Login);